import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from '@/components/AuthForm'

// Mock Firebase auth
jest.mock('@/firebase/client', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  },
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AuthForm - Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in form by default', () => {
    render(<AuthForm />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to sign up form', () => {
    render(<AuthForm />)
    
    const switchButton = screen.getByText(/don't have an account/i)
    fireEvent.click(switchButton)
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<AuthForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<AuthForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(<AuthForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})























