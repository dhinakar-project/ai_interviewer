import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import AuthForm from '@/components/AuthForm'
import { mockUser, mockRouter } from '../utils/test-utils'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: 'local',
  browserSessionPersistence: 'session',
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}))

jest.mock('@/lib/actions/auth.action', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}))

describe('AuthForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Sign In Form', () => {
    it('renders sign in form correctly', () => {
      render(<AuthForm type="sign-in" />)
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(<AuthForm type="sign-in" />)
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('handles successful sign in', async () => {
      const { signInWithEmailAndPassword, setPersistence } = require('firebase/auth')
      const { signIn } = require('@/lib/actions/auth.action')
      
      signInWithEmailAndPassword.mockResolvedValue({
        user: { getIdToken: jest.fn().mockResolvedValue('test-token') }
      })
      setPersistence.mockResolvedValue(undefined)
      signIn.mockResolvedValue({ success: true, message: 'Signed in successfully.' })

      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        )
        expect(signIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          idToken: 'test-token'
        })
        expect(toast.success).toHaveBeenCalledWith('Signed in successfully.')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })
    })

    it('handles sign in error', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth')
      signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))

      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('There was an error: Error: Invalid credentials')
      })
    })

    it('toggles password visibility', async () => {
      render(<AuthForm type="sign-in" />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('handles remember me checkbox', async () => {
      const { setPersistence } = require('firebase/auth')
      setPersistence.mockResolvedValue(undefined)

      render(<AuthForm type="sign-in" />)
      
      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
      await user.click(rememberCheckbox)
      
      expect(rememberCheckbox).toBeChecked()
    })
  })

  describe('Sign Up Form', () => {
    it('renders sign up form correctly', () => {
      render(<AuthForm type="sign-up" />)
      
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    })

    it('validates name field for sign up', async () => {
      render(<AuthForm type="sign-up" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signUpButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(signUpButton)

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument()
      })
    })

    it('handles successful sign up', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth')
      const { signUp } = require('@/lib/actions/auth.action')
      
      createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-uid' }
      })
      signUp.mockResolvedValue({ success: true, message: 'Account created successfully. Please sign in.' })

      render(<AuthForm type="sign-up" />)
      
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signUpButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(signUpButton)

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        )
        expect(signUp).toHaveBeenCalledWith({
          uid: 'test-uid',
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        expect(toast.success).toHaveBeenCalledWith('Account created successfully. Please sign in.')
        expect(mockRouter.push).toHaveBeenCalledWith('/sign-in')
      })
    })

    it('handles sign up error', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth')
      createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'))

      render(<AuthForm type="sign-up" />)
      
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signUpButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(signUpButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('There was an error: Error: Email already in use')
      })
    })
  })

  describe('Form States', () => {
    it('shows loading state during submission', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth')
      signInWithEmailAndPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(signInButton).toBeDisabled()
    })

    it('disables form during submission', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth')
      signInWithEmailAndPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AuthForm type="sign-in" />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /toggle password visibility/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<AuthForm type="sign-in" />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      
      emailInput.focus()
      expect(emailInput).toHaveFocus()
      
      await user.tab()
      expect(passwordInput).toHaveFocus()
      
      await user.tab()
      expect(signInButton).toHaveFocus()
    })
  })
})























