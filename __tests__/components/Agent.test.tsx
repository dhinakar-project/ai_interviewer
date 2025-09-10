import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import Agent from '@/components/Agent'
import { mockUser, mockInterview, mockTranscript, mockRouter } from '../utils/test-utils'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}))

jest.mock('@/lib/vapi.sdk', () => ({
  vapi: {
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
}))

jest.mock('@/lib/actions/general.action', () => ({
  createFeedback: jest.fn(),
}))

describe('Agent', () => {
  const user = userEvent.setup()
  const defaultProps = {
    userName: 'Test User',
    userId: 'test-user-id',
    interviewId: 'test-interview-id',
    type: 'custom' as const,
    questions: ['What is React?', 'Explain TypeScript benefits'],
    role: 'Frontend Developer',
    level: 'Junior',
    amount: '5',
    techstack: 'React, TypeScript',
    userProfileURL: '/test-avatar.png',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders agent interface correctly', () => {
      render(<Agent {...defaultProps} />)
      
      expect(screen.getByText('AI Interviewer')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument()
    })

    it('renders in hidden mode when hidden prop is true', () => {
      render(<Agent {...defaultProps} hidden={true} />)
      
      const hiddenButton = screen.getByRole('button', { hidden: true })
      const container = hiddenButton.closest('div')
      expect(container).toHaveClass('hidden')
    })

    it('displays user profile image when provided', () => {
      render(<Agent {...defaultProps} />)
      
      const profileImage = screen.getByAltText('User Profile')
      expect(profileImage).toHaveAttribute('src', '/test-avatar.png')
    })

    it('displays user initial when no profile image', () => {
      render(<Agent {...defaultProps} userProfileURL={undefined} />)
      
      expect(screen.getByText('T')).toBeInTheDocument()
    })
  })

  describe('VAPI Integration', () => {
    it('starts VAPI call when start interview is clicked', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockResolvedValue(undefined)

      render(<Agent {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      
      await act(async () => {
        await user.click(startButton)
      })

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            variableValues: {
              questions: '- What is React?\n- Explain TypeScript benefits',
            },
          })
        )
      })
    })

    it('handles VAPI start error', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockRejectedValue(new Error('VAPI connection failed'))

      render(<Agent {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to start interview')
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
      })
    })

    it('stops VAPI call when end interview is clicked', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)

      render(<Agent {...defaultProps} />)
      
      // Start interview first
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /end interview/i })).toBeInTheDocument()
      })

      const endButton = screen.getByRole('button', { name: /end interview/i })
      await user.click(endButton)

      expect(vapi.stop).toHaveBeenCalled()
    })

    it('handles VAPI error events', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate VAPI error
      const errorCallback = vapi.on.mock.calls.find(call => call[0] === 'error')?.[1]
      if (errorCallback) {
        errorCallback(new Error('VAPI Error: {}'))
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Connection error. Please try again.')
      })
    })

    it('handles VAPI call start event', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate VAPI call start
      const callStartCallback = vapi.on.mock.calls.find(call => call[0] === 'call-start')?.[1]
      if (callStartCallback) {
        callStartCallback()
      }

      await waitFor(() => {
        expect(screen.getByText(/interview in progress/i)).toBeInTheDocument()
      })
    })

    it('handles VAPI call end event', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate VAPI call end
      const callEndCallback = vapi.on.mock.calls.find(call => call[0] === 'call-end')?.[1]
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(screen.getByText(/interview completed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Transcript Handling', () => {
    it('displays transcript messages', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate transcript message
      const messageCallback = vapi.on.mock.calls.find(call => call[0] === 'message')?.[1]
      if (messageCallback) {
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'assistant',
          transcript: 'Hello! How are you today?'
        })
      }

      await waitFor(() => {
        expect(screen.getByText('Hello! How are you today?')).toBeInTheDocument()
      })
    })

    it('displays live transcript section when messages exist', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate multiple transcript messages
      const messageCallback = vapi.on.mock.calls.find(call => call[0] === 'message')?.[1]
      if (messageCallback) {
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'assistant',
          transcript: 'Hello! How are you today?'
        })
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'user',
          transcript: 'I am doing well, thank you!'
        })
      }

      await waitFor(() => {
        expect(screen.getByText('Live Transcript')).toBeInTheDocument()
        expect(screen.getByText('Hello! How are you today?')).toBeInTheDocument()
        expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument()
      })
    })
  })

  describe('Feedback Generation', () => {
    it('generates feedback when call ends with messages', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      const { createFeedback } = require('@/lib/actions/general.action')
      
      createFeedback.mockResolvedValue({
        success: true,
        feedbackId: 'test-feedback-id'
      })

      render(<Agent {...defaultProps} />)
      
      // Add transcript messages
      const messageCallback = vapi.on.mock.calls.find(call => call[0] === 'message')?.[1]
      if (messageCallback) {
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'assistant',
          transcript: 'Hello! How are you today?'
        })
      }

      // End call
      const callEndCallback = vapi.on.mock.calls.find(call => call[0] === 'call-end')?.[1]
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(createFeedback).toHaveBeenCalledWith({
          interviewId: 'test-interview-id',
          userId: 'test-user-id',
          transcript: expect.arrayContaining([
            expect.objectContaining({
              role: 'assistant',
              content: 'Hello! How are you today?'
            })
          ]),
          feedbackId: undefined,
        })
        expect(toast.success).toHaveBeenCalledWith('Interview completed! Generating feedback...')
      })
    })

    it('handles feedback generation error', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      const { createFeedback } = require('@/lib/actions/general.action')
      
      createFeedback.mockResolvedValue({
        success: false,
        error: 'Failed to generate feedback'
      })

      render(<Agent {...defaultProps} />)
      
      // Add transcript messages
      const messageCallback = vapi.on.mock.calls.find(call => call[0] === 'message')?.[1]
      if (messageCallback) {
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'assistant',
          transcript: 'Hello! How are you today?'
        })
      }

      // End call
      const callEndCallback = vapi.on.mock.calls.find(call => call[0] === 'call-end')?.[1]
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save interview feedback')
      })
    })

    it('shows error when no messages for feedback', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // End call without messages
      const callEndCallback = vapi.on.mock.calls.find(call => call[0] === 'call-end')?.[1]
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('No conversation data to analyze. Please try the interview again.')
      })
    })
  })

  describe('Speech States', () => {
    it('shows speaking indicator when AI is speaking', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate speech start
      const speechStartCallback = vapi.on.mock.calls.find(call => call[0] === 'speech-start')?.[1]
      if (speechStartCallback) {
        speechStartCallback()
      }

      await waitFor(() => {
        expect(screen.getByText('Speaking...')).toBeInTheDocument()
      })
    })

    it('hides speaking indicator when AI stops speaking', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      render(<Agent {...defaultProps} />)
      
      // Simulate speech start
      const speechStartCallback = vapi.on.mock.calls.find(call => call[0] === 'speech-start')?.[1]
      if (speechStartCallback) {
        speechStartCallback()
      }

      await waitFor(() => {
        expect(screen.getByText('Speaking...')).toBeInTheDocument()
      })

      // Simulate speech end
      const speechEndCallback = vapi.on.mock.calls.find(call => call[0] === 'speech-end')?.[1]
      if (speechEndCallback) {
        speechEndCallback()
      }

      await waitFor(() => {
        expect(screen.getByText('Ready to interview')).toBeInTheDocument()
      })
    })
  })

  describe('Generate Type Interviews', () => {
    it('starts generate workflow when type is generate', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockResolvedValue(undefined)

      render(<Agent {...defaultProps} type="generate" />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          'test-workflow-id',
          expect.objectContaining({
            variableValues: {
              username: 'Test User',
              userid: 'test-user-id',
              role: 'Frontend Developer',
              level: 'Junior',
              amount: '5',
              techstack: 'React, TypeScript',
              type: 'technical'
            },
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when connection fails', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockRejectedValue(new Error('Network error'))

      render(<Agent {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
        expect(screen.getByText(/failed to start interview/i)).toBeInTheDocument()
      })
    })

    it('allows retry after error', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)

      render(<Agent {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
      })

      // Retry
      await user.click(startButton)

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Agent {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /start interview/i })).toBeInTheDocument()
      expect(screen.getByAltText('AI Interviewer')).toBeInTheDocument()
      expect(screen.getByAltText('User Profile')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<Agent {...defaultProps} />)
      
      const startButton = screen.getByRole('button', { name: /start interview/i })
      startButton.focus()
      expect(startButton).toHaveFocus()
      
      await user.tab()
      // Should focus on next interactive element
    })
  })

  describe('Hidden Mode', () => {
    it('handles join event in hidden mode', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.start.mockResolvedValue(undefined)

      render(<Agent {...defaultProps} hidden={true} />)
      
      // Simulate join event
      window.dispatchEvent(new Event('agent-join'))

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalled()
      })
    })

    it('handles end event in hidden mode', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      vapi.stop.mockResolvedValue(undefined)

      render(<Agent {...defaultProps} hidden={true} />)
      
      // Simulate end event
      window.dispatchEvent(new Event('agent-end'))

      expect(vapi.stop).toHaveBeenCalled()
    })
  })
})




















