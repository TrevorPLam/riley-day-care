import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from '@/components/shared/SectionHeader'

describe('SectionHeader Component', () => {
  test('should render title with default left alignment', () => {
    render(<SectionHeader title="Test Title" />)
    const heading = screen.getByRole('heading', { name: 'Test Title' })
    
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('text-2xl', 'font-semibold', 'tracking-tight', 'text-slate-900')
  })

  test('should render with eyebrow text', () => {
    render(<SectionHeader eyebrow="Eyebrow Text" title="Unique Title" />)
    const eyebrow = screen.getByText('Eyebrow Text')
    
    expect(eyebrow).toBeInTheDocument()
    expect(eyebrow).toHaveClass('text-xs', 'font-semibold', 'uppercase', 'tracking-[0.2em]', 'text-brand')
  })

  test('should render children as description', () => {
    render(
      <SectionHeader title="Another Title">
        Description text
      </SectionHeader>
    )
    const description = screen.getByText('Description text')
    
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('max-w-2xl', 'text-sm', 'leading-relaxed', 'text-slate-600')
  })

  test('should apply center alignment when specified', () => {
    render(<SectionHeader title="Centered Title" align="center" />)
    const container = screen.getByRole('heading', { name: 'Centered Title' }).parentElement
    
    expect(container).toHaveClass('items-center', 'text-center')
  })

  test('should apply left alignment by default', () => {
    render(<SectionHeader title="Left Title" />)
    const container = screen.getByRole('heading', { name: 'Left Title' }).parentElement
    
    expect(container).toHaveClass('items-start', 'text-left')
  })
})
