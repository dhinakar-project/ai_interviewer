import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Simple test component
const SimpleButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <button onClick={onClick} data-testid="simple-button">
      {children}
    </button>
  )
}

const SimpleForm = () => {
  const [value, setValue] = React.useState('')
  
  return (
    <div>
      <input
        data-testid="simple-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text"
      />
      <span data-testid="display-value">{value}</span>
    </div>
  )
}

describe('Simple React Component Tests', () => {
  it('renders a simple button', () => {
    const handleClick = jest.fn()
    render(<SimpleButton onClick={handleClick}>Click me</SimpleButton>)
    
    const button = screen.getByTestId('simple-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('handles button click', () => {
    const handleClick = jest.fn()
    render(<SimpleButton onClick={handleClick}>Click me</SimpleButton>)
    
    const button = screen.getByTestId('simple-button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders a simple form with input', () => {
    render(<SimpleForm />)
    
    const input = screen.getByTestId('simple-input')
    const display = screen.getByTestId('display-value')
    
    expect(input).toBeInTheDocument()
    expect(display).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Enter text')
  })

  it('handles input changes', () => {
    render(<SimpleForm />)
    
    const input = screen.getByTestId('simple-input')
    const display = screen.getByTestId('display-value')
    
    fireEvent.change(input, { target: { value: 'Hello World' } })
    
    expect(display).toHaveTextContent('Hello World')
  })

  it('handles multiple input changes', () => {
    render(<SimpleForm />)
    
    const input = screen.getByTestId('simple-input')
    const display = screen.getByTestId('display-value')
    
    fireEvent.change(input, { target: { value: 'First' } })
    expect(display).toHaveTextContent('First')
    
    fireEvent.change(input, { target: { value: 'Second' } })
    expect(display).toHaveTextContent('Second')
    
    fireEvent.change(input, { target: { value: '' } })
    expect(display).toHaveTextContent('')
  })
})























