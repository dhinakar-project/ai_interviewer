import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoInterview from '@/components/VideoInterview'
import { mockUser } from '../utils/test-utils'

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn()
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
})

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn()
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
})

// Mock fetch
global.fetch = jest.fn()

describe('VideoInterview', () => {
  const user = userEvent.setup()
  const defaultProps = {
    interviewId: 'test-interview-id',
    userId: 'test-user-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [
        { stop: jest.fn(), enabled: true },
        { stop: jest.fn(), enabled: true },
      ],
      getAudioTracks: () => [{ enabled: true }],
      getVideoTracks: () => [{ enabled: true }],
    })
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  describe('Rendering', () => {
    it('renders video interview interface correctly', () => {
      render(<VideoInterview {...defaultProps} />)
      
      expect(screen.getByText('AI Interviewer')).toBeInTheDocument()
      expect(screen.getByText('You')).toBeInTheDocument()
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('displays connection status correctly', () => {
      render(<VideoInterview {...defaultProps} />)
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('shows AI interviewer placeholder when not connected', () => {
      render(<VideoInterview {...defaultProps} />)
      
      expect(screen.getByAltText('AI')).toBeInTheDocument()
      expect(screen.getByText('Ready to begin your interview')).toBeInTheDocument()
    })
  })

  describe('Media Access', () => {
    it('requests camera and microphone access on mount', async () => {
      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: true,
          audio: true,
        })
      })
    })

    it('handles media access success', async () => {
      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
    })

    it('handles media access error', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
    })

    it('shows connecting state while accessing media', async () => {
      mockGetUserMedia.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<VideoInterview {...defaultProps} />)

      expect(screen.getByText('Connecting camera...')).toBeInTheDocument()
    })
  })

  describe('Video Controls', () => {
    it('toggles video on/off', async () => {
      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Video On')).toBeInTheDocument()
      })

      const videoToggleButton = screen.getByRole('button', { name: /toggle video/i })
      await user.click(videoToggleButton)

      expect(screen.getByText('Video Off')).toBeInTheDocument()
    })

    it('toggles audio mute/unmute', async () => {
      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Audio On')).toBeInTheDocument()
      })

      const audioToggleButton = screen.getByRole('button', { name: /toggle mute/i })
      await user.click(audioToggleButton)

      expect(screen.getByText('Muted')).toBeInTheDocument()
    })

    it('joins interview when join button is clicked', async () => {
      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(screen.getByText('Live')).toBeInTheDocument()
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
    })

    it('ends interview when end button is clicked', async () => {
      render(<VideoInterview {...defaultProps} />)

      // First join
      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      // Then end
      const endButton = screen.getByRole('button', { name: /end/i })
      await user.click(endButton)

      expect(screen.getByText('Connecting...')).toBeInTheDocument()
      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event))
    })
  })

  describe('Gesture Tracking', () => {
    it('starts gesture tracking when joined', async () => {
      jest.useFakeTimers()

      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      // Fast-forward time to trigger gesture tracking
      jest.advanceTimersByTime(2000)

      expect(fetch).toHaveBeenCalledWith('/api/user/gestures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('interviewId'),
      })

      jest.useRealTimers()
    })

    it('stops gesture tracking when ended', async () => {
      jest.useFakeTimers()

      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      const endButton = screen.getByRole('button', { name: /end/i })
      await user.click(endButton)

      // Fast-forward time
      jest.advanceTimersByTime(2000)

      // Should not call fetch after ending
      const fetchCalls = (fetch as jest.Mock).mock.calls.length
      jest.advanceTimersByTime(2000)
      expect((fetch as jest.Mock).mock.calls.length).toBe(fetchCalls)

      jest.useRealTimers()
    })

    it('sends gesture metrics data', async () => {
      jest.useFakeTimers()

      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      jest.advanceTimersByTime(2000)

      expect(fetch).toHaveBeenCalledWith('/api/user/gestures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"interviewId":"test-interview-id"'),
      })

      const requestBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(requestBody).toHaveProperty('interviewId', 'test-interview-id')
      expect(requestBody).toHaveProperty('timestamp')
      expect(requestBody).toHaveProperty('metrics')

      jest.useRealTimers()
    })
  })

  describe('Transcript Display', () => {
    it('displays transcript messages when received', async () => {
      render(<VideoInterview {...defaultProps} />)

      // Simulate transcript event
      const transcriptEvent = new CustomEvent('agent-transcript', {
        detail: {
          role: 'assistant',
          content: 'Hello! How are you today?',
        },
      })
      window.dispatchEvent(transcriptEvent)

      await waitFor(() => {
        expect(screen.getByText('Live Transcript')).toBeInTheDocument()
        expect(screen.getByText('Hello! How are you today?')).toBeInTheDocument()
      })
    })

    it('displays multiple transcript messages', async () => {
      render(<VideoInterview {...defaultProps} />)

      // Simulate multiple transcript events
      const transcriptEvent1 = new CustomEvent('agent-transcript', {
        detail: {
          role: 'assistant',
          content: 'Hello! How are you today?',
        },
      })
      const transcriptEvent2 = new CustomEvent('agent-transcript', {
        detail: {
          role: 'user',
          content: 'I am doing well, thank you!',
        },
      })

      window.dispatchEvent(transcriptEvent1)
      window.dispatchEvent(transcriptEvent2)

      await waitFor(() => {
        expect(screen.getByText('Live Transcript')).toBeInTheDocument()
        expect(screen.getByText('Hello! How are you today?')).toBeInTheDocument()
        expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument()
      })
    })

    it('shows correct role labels in transcript', async () => {
      render(<VideoInterview {...defaultProps} />)

      const transcriptEvent = new CustomEvent('agent-transcript', {
        detail: {
          role: 'assistant',
          content: 'Hello! How are you today?',
        },
      })
      window.dispatchEvent(transcriptEvent)

      await waitFor(() => {
        expect(screen.getByText('AI Interviewer')).toBeInTheDocument()
      })
    })
  })

  describe('Status Updates', () => {
    it('updates connection status when agent events are received', async () => {
      render(<VideoInterview {...defaultProps} />)

      // Simulate agent active event
      const activeEvent = new Event('agent-status-active')
      window.dispatchEvent(activeEvent)

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument()
      })

      // Simulate agent ended event
      const endedEvent = new Event('agent-status-ended')
      window.dispatchEvent(endedEvent)

      await waitFor(() => {
        expect(screen.getByText('Connecting...')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles gesture API errors gracefully', async () => {
      jest.useFakeTimers()
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      jest.advanceTimersByTime(2000)

      // Should not crash when gesture API fails
      expect(fetch).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('handles media stream errors', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Camera not available'))

      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for video controls', () => {
      render(<VideoInterview {...defaultProps} />)

      expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /toggle mute/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /toggle video/i })).toBeInTheDocument()
    })

    it('has proper video element attributes', async () => {
      render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        const videoElement = screen.getByTitle('You')
        expect(videoElement).toHaveAttribute('playsInline')
        expect(videoElement).toHaveAttribute('autoPlay')
      })
    })
  })

  describe('Responsive Design', () => {
    it('renders correctly on different screen sizes', () => {
      const { container } = render(<VideoInterview {...defaultProps} />)

      // Check for responsive grid classes
      expect(container.querySelector('.grid-cols-1.lg\\:grid-cols-2')).toBeInTheDocument()
    })
  })

  describe('Cleanup', () => {
    it('stops media tracks on unmount', async () => {
      const mockStop = jest.fn()
      mockGetUserMedia.mockResolvedValue({
        getTracks: () => [{ stop: mockStop }],
        getAudioTracks: () => [{ enabled: true }],
        getVideoTracks: () => [{ enabled: true }],
      })

      const { unmount } = render(<VideoInterview {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled()
      })

      unmount()

      expect(mockStop).toHaveBeenCalled()
    })
  })

  describe('Real-time Features', () => {
    it('updates metrics in real-time', async () => {
      jest.useFakeTimers()

      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      await user.click(joinButton)

      // Fast-forward multiple intervals
      jest.advanceTimersByTime(2000)
      jest.advanceTimersByTime(2000)

      expect(fetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('handles rapid state changes', async () => {
      render(<VideoInterview {...defaultProps} />)

      const joinButton = screen.getByRole('button', { name: /join/i })
      const endButton = screen.getByRole('button', { name: /end/i })

      // Rapid join/end cycles
      await user.click(joinButton)
      await user.click(endButton)
      await user.click(joinButton)

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })
})























