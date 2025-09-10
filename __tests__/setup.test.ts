import '@testing-library/jest-dom'

describe('Jest Setup Test', () => {
  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)
    
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello World')
    
    document.body.removeChild(element)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should handle basic DOM operations', () => {
    const button = document.createElement('button')
    button.textContent = 'Click me'
    button.disabled = true
    
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Click me')
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
    expect(numbers.filter(n => n > 3)).toEqual([4, 5])
  })

  it('should handle object operations', () => {
    const user = { name: 'John', age: 30, email: 'john@example.com' }
    expect(user).toHaveProperty('name')
    expect(user.name).toBe('John')
    expect(user.age).toBeGreaterThan(18)
  })
})























