import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Toaster } from 'sonner'

// Mock data for tests
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  profileURL: '/test-avatar.png',
}

export const mockInterview = {
  id: 'test-interview-id',
  userId: 'test-user-id',
  role: 'Frontend Developer',
  type: 'Technical',
  techstack: ['React', 'TypeScript', 'Next.js'],
  level: 'Junior',
  questions: ['What is React?', 'Explain TypeScript benefits'],
  finalized: true,
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockFeedback = {
  id: 'test-feedback-id',
  interviewId: 'test-interview-id',
  userId: 'test-user-id',
  totalScore: 85,
  categoryScores: [
    { name: 'Communication Skills', score: 80, comment: 'Good communication' },
    { name: 'Technical Knowledge', score: 85, comment: 'Strong technical skills' },
    { name: 'Problem Solving', score: 80, comment: 'Good problem solving' },
    { name: 'Cultural Fit', score: 90, comment: 'Great cultural fit' },
    { name: 'Confidence and Clarity', score: 85, comment: 'Confident presentation' },
  ],
  strengths: ['Clear communication', 'Technical knowledge'],
  areasForImprovement: ['Problem solving', 'Time management'],
  finalAssessment: 'Strong candidate with room for improvement',
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockTranscript = [
  { role: 'assistant', content: 'Hello! Thank you for taking the time to speak with me today.' },
  { role: 'user', content: 'Thank you for having me.' },
  { role: 'assistant', content: 'Can you tell me about your experience with React?' },
  { role: 'user', content: 'I have been working with React for about 2 years now.' },
]

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Custom test utilities
export const waitForElementToBeRemoved = (element: HTMLElement) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect()
        resolve(true)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

export const mockFirebaseAuth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: jest.fn().mockResolvedValue('test-token'),
  },
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
}

export const mockVapi = {
  on: jest.fn(),
  off: jest.fn(),
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
}

export const mockMediaStream = {
  getTracks: jest.fn().mockReturnValue([
    { stop: jest.fn(), enabled: true },
  ]),
  getAudioTracks: jest.fn().mockReturnValue([
    { enabled: true },
  ]),
  getVideoTracks: jest.fn().mockReturnValue([
    { enabled: true },
  ]),
}

// Test constants
export const TEST_IDS = {
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  SUCCESS_MESSAGE: 'success-message',
  INTERVIEW_CARD: 'interview-card',
  PROGRESS_DASHBOARD: 'progress-dashboard',
  AUTH_FORM: 'auth-form',
  VAPI_DEBUGGER: 'vapi-debugger',
}

// Mock functions for common operations
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  message: jest.fn(),
}























