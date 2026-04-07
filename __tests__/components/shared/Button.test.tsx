import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/shared/Button'

describe('Button Component', () => {
  test('should render with default primary variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-brand', 'text-white', 'hover:bg-brand-dark')
  })

  test('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: 'Secondary' })
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-accent', 'text-slate-900', 'hover:bg-accent-soft')
  })

  test('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: 'Ghost' })
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-transparent', 'text-brand', 'hover:bg-accent-soft')
  })

  test('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: 'Custom' })
    
    expect(button).toHaveClass('custom-class')
  })

  test('should handle click events', async () => {
    const userEvent = await import('@testing-library/user-event')
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    
    await userEvent.default.setup().click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should pass through other button props', () => {
    render(<Button disabled type="submit">Disabled</Button>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
  })

  test('should have base styling classes', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button', { name: 'Button' })
    
    expect(button).toHaveClass(
      'inline-flex',
      'items-center', 
      'justify-center',
      'rounded-full',
      'px-5',
      'py-2.5',
      'text-sm',
      'font-semibold',
      'transition',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-brand'
    )
  })
})
