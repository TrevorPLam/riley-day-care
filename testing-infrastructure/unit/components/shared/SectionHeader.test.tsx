import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from '@/components/shared/SectionHeader'

describe('SectionHeader Component', () => {
  test('renders the provided title as a level-2 heading', () => {
    render(<SectionHeader title="Section title" />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Section title' })
    ).toBeInTheDocument()
  })
})
