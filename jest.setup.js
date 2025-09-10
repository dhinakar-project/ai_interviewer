import '@testing-library/jest-dom'
import './__tests__/mocks/firebase'
import './__tests__/mocks/vapi'
import { TextEncoder, TextDecoder } from 'util'
// import { server } from './__tests__/mocks/server'
// import 'whatwg-fetch'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  },
}))

// Mock Firebase
jest.mock('@/firebase/client', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}))

jest.mock('@/firebase/admin', () => ({
  auth: {
    createSessionCookie: jest.fn(),
    verifySessionCookie: jest.fn(),
    getUserByEmail: jest.fn(),
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  },
}))

// Mock VAPI
jest.mock('@/lib/vapi.sdk', () => ({
  vapi: {
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN = 'test-vapi-token'
process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID = 'test-workflow-id'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn(),
        enabled: true,
      }],
      getAudioTracks: () => [{
        enabled: true,
      }],
      getVideoTracks: () => [{
        enabled: true,
      }],
    }),
  },
  writable: true,
})

// Mock WebRTC
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn(),
  createAnswer: jest.fn(),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
  },
}))

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// Global test utilities
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Setup MSW
// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
