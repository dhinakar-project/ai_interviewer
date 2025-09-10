# AI Interviewer Test Suite

This directory contains a comprehensive test suite for the AI Interviewer application, covering unit tests, integration tests, and end-to-end scenarios.

## 🧪 Testing Strategy

### Test Types

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test how components work together
3. **API Tests** - Test API endpoints and data flow
4. **E2E Scenarios** - Test complete user workflows

### Testing Stack

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **MSW (Mock Service Worker)** - API mocking
- **User Event** - User interaction simulation

## 📁 Test Structure

```
__tests__/
├── components/           # Component unit tests
│   ├── AuthForm.test.tsx
│   ├── Agent.test.tsx
│   ├── ProgressDashboard.test.tsx
│   └── VideoInterview.test.tsx
├── integration/          # Integration tests
│   └── InterviewFlow.test.tsx
├── api/                  # API route tests
│   └── user-stats.test.ts
├── mocks/                # Mock configurations
│   └── server.ts
└── utils/                # Test utilities
    └── test-utils.tsx
```

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in CI Mode
```bash
npm run test:ci
```

## 📊 Test Coverage

The test suite aims for **70%+ coverage** across:
- Components
- API routes
- Utility functions
- Integration flows

### Coverage Areas

1. **Authentication Flow** (AuthForm.test.tsx)
   - Sign in/up form validation
   - Error handling
   - Success flows
   - Loading states

2. **VAPI Integration** (Agent.test.tsx)
   - Voice AI connection
   - Transcript handling
   - Error recovery
   - Feedback generation

3. **Analytics Dashboard** (ProgressDashboard.test.tsx)
   - Data fetching
   - Chart rendering
   - Error states
   - Loading states

4. **Video Interview** (VideoInterview.test.tsx)
   - Media access
   - Video controls
   - Gesture tracking
   - Real-time features

5. **Complete Interview Flow** (InterviewFlow.test.tsx)
   - End-to-end scenarios
   - Data persistence
   - Error recovery
   - Performance testing

6. **API Routes** (user-stats.test.ts)
   - Request validation
   - Error handling
   - Response formatting

## 🎯 Key Test Scenarios

### Authentication Tests
- ✅ Form validation (email, password, name)
- ✅ Successful sign in/up flows
- ✅ Error handling (network, validation)
- ✅ Loading states and disabled forms
- ✅ Password visibility toggle
- ✅ Remember me functionality

### VAPI Integration Tests
- ✅ VAPI connection establishment
- ✅ Real-time transcript handling
- ✅ Speech state management
- ✅ Error recovery and reconnection
- ✅ Feedback generation workflow
- ✅ Interview type handling (custom vs generate)

### Analytics Dashboard Tests
- ✅ Data fetching and display
- ✅ Chart rendering (bar, line, donut)
- ✅ Score color coding
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Retry functionality

### Video Interview Tests
- ✅ Camera/microphone access
- ✅ Video/audio controls
- ✅ Gesture tracking
- ✅ Real-time transcript display
- ✅ Connection status updates
- ✅ Media stream cleanup

### Integration Tests
- ✅ Complete interview cycle
- ✅ Data persistence
- ✅ Error recovery
- ✅ Performance under load
- ✅ Large transcript handling

## 🔧 Test Utilities

### Mock Data
```typescript
// Predefined mock data for consistent testing
export const mockUser = { /* ... */ }
export const mockInterview = { /* ... */ }
export const mockFeedback = { /* ... */ }
export const mockTranscript = [ /* ... */ ]
```

### Custom Render Function
```typescript
// Custom render with providers and mocks
import { render } from '../utils/test-utils'
```

### MSW Handlers
```typescript
// API mocking for consistent test environment
export const handlers = [ /* ... */ ]
```

## 🛠️ Mocking Strategy

### External Dependencies
- **Firebase** - Mocked for authentication and database
- **VAPI** - Mocked for voice AI functionality
- **Next.js Router** - Mocked for navigation
- **Media APIs** - Mocked for camera/microphone access

### Browser APIs
- **navigator.mediaDevices** - Mocked for media access
- **window.matchMedia** - Mocked for responsive design
- **ResizeObserver** - Mocked for chart components
- **IntersectionObserver** - Mocked for lazy loading

## 📈 Performance Testing

### Load Testing
- Rapid interview sessions
- Large transcript data handling
- Multiple concurrent operations

### Memory Testing
- Component cleanup
- Event listener removal
- Media stream cleanup

## 🐛 Debugging Tests

### Common Issues

1. **Async Operations**
   ```typescript
   await waitFor(() => {
     expect(element).toBeInTheDocument()
   })
   ```

2. **Mock Resets**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })
   ```

3. **Event Simulation**
   ```typescript
   await user.click(button)
   await user.type(input, 'text')
   ```

### Debug Commands
```bash
# Run specific test file
npm test -- AuthForm.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="sign in"

# Run tests with verbose output
npm test -- --verbose
```

## 📝 Writing New Tests

### Component Test Template
```typescript
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComponentName from '@/components/ComponentName'

describe('ComponentName', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    render(<ComponentName />)
    const button = screen.getByRole('button')
    await user.click(button)
    // Assert expected behavior
  })
})
```

### API Test Template
```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/route'

describe('/api/route', () => {
  it('handles GET requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/route')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

## 🎯 Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal implementation details

2. **Use Semantic Queries**
   - Prefer `getByRole` over `getByTestId`
   - Use accessible queries when possible

3. **Test Error States**
   - Network failures
   - Validation errors
   - Loading states

4. **Keep Tests Independent**
   - Reset mocks between tests
   - Don't rely on test order

5. **Use Descriptive Test Names**
   - Clear about what is being tested
   - Include expected outcome

## 📊 Coverage Goals

- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

## 🔄 Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Release deployments

### CI Commands
```bash
npm run test:ci  # Runs tests with coverage in CI mode
```

## 🆘 Troubleshooting

### Common Problems

1. **Test Environment Issues**
   - Ensure all mocks are properly configured
   - Check Jest setup files

2. **Async Test Failures**
   - Use `waitFor` for async operations
   - Check for proper cleanup

3. **Mock Issues**
   - Verify mock implementations
   - Check mock reset in `beforeEach`

### Getting Help
- Check Jest documentation
- Review React Testing Library guides
- Look at existing test examples in the codebase























