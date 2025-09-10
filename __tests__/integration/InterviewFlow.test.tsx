import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import Agent from '@/components/Agent'
import VideoInterview from '@/components/VideoInterview'
import ProgressDashboard from '@/components/ProgressDashboard'
import { mockUser, mockInterview, mockTranscript } from '../utils/test-utils'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
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

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Interview Flow Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  describe('Complete Interview Flow', () => {
    it('completes full interview cycle with feedback generation', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      const { createFeedback } = require('@/lib/actions/general.action')
      
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)
      createFeedback.mockResolvedValue({
        success: true,
        feedbackId: 'test-feedback-id'
      })

      // Mock VAPI event handlers
      let callStartCallback: (() => void) | undefined
      let messageCallback: ((message: any) => void) | undefined
      let callEndCallback: (() => void) | undefined

      vapi.on.mockImplementation((event: string, callback: any) => {
        if (event === 'call-start') callStartCallback = callback
        if (event === 'message') messageCallback = callback
        if (event === 'call-end') callEndCallback = callback
      })

      // Render Agent component
      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?', 'Explain TypeScript benefits']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React, TypeScript"
          userProfileURL="/test-avatar.png"
        />
      )

      // Step 1: Start interview
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalled()
      })

      // Step 2: Simulate call start
      if (callStartCallback) {
        callStartCallback()
      }

      await waitFor(() => {
        expect(screen.getByText(/interview in progress/i)).toBeInTheDocument()
      })

      // Step 3: Simulate transcript messages
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
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'assistant',
          transcript: 'Can you tell me about React?'
        })
        messageCallback({
          type: 'transcript',
          transcriptType: 'final',
          role: 'user',
          transcript: 'React is a JavaScript library for building user interfaces.'
        })
      }

      await waitFor(() => {
        expect(screen.getByText('Live Transcript')).toBeInTheDocument()
        expect(screen.getByText('Hello! How are you today?')).toBeInTheDocument()
        expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument()
        expect(screen.getByText('Can you tell me about React?')).toBeInTheDocument()
        expect(screen.getByText('React is a JavaScript library for building user interfaces.')).toBeInTheDocument()
      })

      // Step 4: End interview
      const endButton = screen.getByRole('button', { name: /end interview/i })
      await user.click(endButton)

      // Step 5: Simulate call end
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(screen.getByText(/interview completed/i)).toBeInTheDocument()
      })

      // Step 6: Verify feedback generation
      await waitFor(() => {
        expect(createFeedback).toHaveBeenCalledWith({
          interviewId: 'test-interview-id',
          userId: 'test-user-id',
          transcript: expect.arrayContaining([
            expect.objectContaining({
              role: 'assistant',
              content: 'Hello! How are you today?'
            }),
            expect.objectContaining({
              role: 'user',
              content: 'I am doing well, thank you!'
            }),
            expect.objectContaining({
              role: 'assistant',
              content: 'Can you tell me about React?'
            }),
            expect.objectContaining({
              role: 'user',
              content: 'React is a JavaScript library for building user interfaces.'
            })
          ]),
          feedbackId: undefined,
        })
        expect(toast.success).toHaveBeenCalledWith('Interview completed! Generating feedback...')
      })
    })

    it('handles interview flow with errors gracefully', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      vapi.start.mockRejectedValueOnce(new Error('VAPI connection failed'))

      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React"
          userProfileURL="/test-avatar.png"
        />
      )

      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to start interview')
        expect(screen.getByText(/connection error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Video Interview Integration', () => {
    it('integrates video interface with agent flow', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)

      // Mock VAPI event handlers
      let callStartCallback: (() => void) | undefined
      let callEndCallback: (() => void) | undefined

      vapi.on.mockImplementation((event: string, callback: any) => {
        if (event === 'call-start') callStartCallback = callback
        if (event === 'call-end') callEndCallback = callback
      })

      // Render both Agent and VideoInterview
      render(
        <div>
          <Agent
            userName="Test User"
            userId="test-user-id"
            interviewId="test-interview-id"
            type="custom"
            questions={['What is React?']}
            role="Frontend Developer"
            level="Junior"
            amount="5"
            techstack="React"
            userProfileURL="/test-avatar.png"
            hidden={true}
          />
          <VideoInterview
            interviewId="test-interview-id"
            userId="test-user-id"
          />
        </div>
      )

      // Start interview from video interface
      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      // Simulate call start
      if (callStartCallback) {
        callStartCallback()
      }

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      // End interview
      const endButton = screen.getByRole('button', { name: /end/i })
      await user.click(endButton)

      // Simulate call end
      if (callEndCallback) {
        callEndCallback()
      }

      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument()
      })
    })
  })

  describe('Analytics Integration', () => {
    it('updates analytics after interview completion', async () => {
      const mockStats = {
        totalInterviews: 6, // Increased from 5
        completedInterviews: 5, // Increased from 4
        averageScore: 78, // Updated average
        bestScore: 85,
        interviewsThisWeek: 3, // Increased from 2
        interviewsThisMonth: 4, // Increased from 3
        improvementRate: 12, // Updated rate
        categoryAverages: {
          'Communication Skills': 82,
          'Technical Knowledge': 72,
          'Problem Solving': 77,
        },
        recentScores: [
          { score: 88, date: '2024-01-16T10:00:00Z', interviewId: 'test-interview-id' },
          { score: 85, date: '2024-01-15T10:00:00Z', interviewId: '1' },
          { score: 75, date: '2024-01-10T10:00:00Z', interviewId: '2' },
        ],
        strengths: ['Clear communication', 'Technical knowledge', 'Problem solving'],
        areasForImprovement: ['Time management'],
        interviewTypes: { 'Technical': 4, 'Behavioral': 2 },
        techStackPerformance: {
          'React': { count: 3, avgScore: 82 },
          'Node.js': { count: 1, avgScore: 75 },
        },
        weeklyProgress: [
          { week: '2024-01-16', interviews: 1, averageScore: 88 },
          { week: '2024-01-15', interviews: 1, averageScore: 85 },
          { week: '2024-01-08', interviews: 1, averageScore: 75 },
        ],
        monthlyProgress: [
          { month: '2024-01', interviews: 3, averageScore: 83 },
        ],
      }

      // Mock the stats API to return updated data
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })

      render(<ProgressDashboard userId="test-user-id" />)

      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument() // Updated total interviews
        expect(screen.getByText('78%')).toBeInTheDocument() // Updated average score
        expect(screen.getByText('12% from last month')).toBeInTheDocument() // Updated improvement rate
      })
    })
  })

  describe('Error Recovery', () => {
    it('recovers from VAPI connection errors', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      vapi.start
        .mockRejectedValueOnce(new Error('Transport disconnected'))
        .mockResolvedValueOnce(undefined)

      // Mock VAPI event handlers
      let errorCallback: ((error: Error) => void) | undefined
      vapi.on.mockImplementation((event: string, callback: any) => {
        if (event === 'error') errorCallback = callback
      })

      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React"
          userProfileURL="/test-avatar.png"
        />
      )

      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      // Simulate VAPI error
      if (errorCallback) {
        errorCallback(new Error('Transport disconnected'))
      }

      await waitFor(() => {
        expect(toast.message).toHaveBeenCalledWith('Reconnecting...', {
          description: 'Re-establishing the call'
        })
      })

      // Should attempt to restart
      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Data Persistence', () => {
    it('persists interview data and feedback', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      const { createFeedback } = require('@/lib/actions/general.action')
      
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)
      createFeedback.mockResolvedValue({
        success: true,
        feedbackId: 'test-feedback-id'
      })

      // Mock VAPI event handlers
      let callStartCallback: (() => void) | undefined
      let messageCallback: ((message: any) => void) | undefined
      let callEndCallback: (() => void) | undefined

      vapi.on.mockImplementation((event: string, callback: any) => {
        if (event === 'call-start') callStartCallback = callback
        if (event === 'message') messageCallback = callback
        if (event === 'call-end') callEndCallback = callback
      })

      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React"
          userProfileURL="/test-avatar.png"
        />
      )

      // Complete interview flow
      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      if (callStartCallback) callStartCallback()

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

      const endButton = screen.getByRole('button', { name: /end interview/i })
      await user.click(endButton)

      if (callEndCallback) callEndCallback()

      // Verify data persistence
      await waitFor(() => {
        expect(createFeedback).toHaveBeenCalledWith({
          interviewId: 'test-interview-id',
          userId: 'test-user-id',
          transcript: expect.arrayContaining([
            expect.objectContaining({
              role: 'assistant',
              content: 'Hello! How are you today?'
            }),
            expect.objectContaining({
              role: 'user',
              content: 'I am doing well, thank you!'
            })
          ]),
          feedbackId: undefined,
        })
      })
    })
  })

  describe('Performance and Load Testing', () => {
    it('handles rapid interview sessions', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)

      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React"
          userProfileURL="/test-avatar.png"
        />
      )

      const startButton = screen.getByRole('button', { name: /start interview/i })
      const endButton = screen.getByRole('button', { name: /end interview/i })

      // Rapid start/stop cycles
      await user.click(startButton)
      await user.click(endButton)
      await user.click(startButton)
      await user.click(endButton)
      await user.click(startButton)

      await waitFor(() => {
        expect(vapi.start).toHaveBeenCalledTimes(3)
        expect(vapi.stop).toHaveBeenCalledTimes(2)
      })
    })

    it('handles large transcript data', async () => {
      const { vapi } = require('@/lib/vapi.sdk')
      const { createFeedback } = require('@/lib/actions/general.action')
      
      vapi.start.mockResolvedValue(undefined)
      vapi.stop.mockResolvedValue(undefined)
      createFeedback.mockResolvedValue({
        success: true,
        feedbackId: 'test-feedback-id'
      })

      // Mock VAPI event handlers
      let callStartCallback: (() => void) | undefined
      let messageCallback: ((message: any) => void) | undefined
      let callEndCallback: (() => void) | undefined

      vapi.on.mockImplementation((event: string, callback: any) => {
        if (event === 'call-start') callStartCallback = callback
        if (event === 'message') messageCallback = callback
        if (event === 'call-end') callEndCallback = callback
      })

      render(
        <Agent
          userName="Test User"
          userId="test-user-id"
          interviewId="test-interview-id"
          type="custom"
          questions={['What is React?']}
          role="Frontend Developer"
          level="Junior"
          amount="5"
          techstack="React"
          userProfileURL="/test-avatar.png"
        />
      )

      const startButton = screen.getByRole('button', { name: /start interview/i })
      await user.click(startButton)

      if (callStartCallback) callStartCallback()

      // Simulate large transcript
      if (messageCallback) {
        for (let i = 0; i < 50; i++) {
          messageCallback({
            type: 'transcript',
            transcriptType: 'final',
            role: i % 2 === 0 ? 'assistant' : 'user',
            transcript: `Message ${i + 1}: This is a long message with detailed content about React and TypeScript development.`
          })
        }
      }

      const endButton = screen.getByRole('button', { name: /end interview/i })
      await user.click(endButton)

      if (callEndCallback) callEndCallback()

      await waitFor(() => {
        expect(createFeedback).toHaveBeenCalledWith({
          interviewId: 'test-interview-id',
          userId: 'test-user-id',
          transcript: expect.arrayContaining(
            Array.from({ length: 50 }, (_, i) => 
              expect.objectContaining({
                role: i % 2 === 0 ? 'assistant' : 'user',
                content: `Message ${i + 1}: This is a long message with detailed content about React and TypeScript development.`
              })
            )
          ),
          feedbackId: undefined,
        })
      })
    })
  })
})























