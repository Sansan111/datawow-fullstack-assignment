import { render, screen } from '@testing-library/react'
import StatCards from '@/app/components/StatCards'

describe('StatCards', () => {
  it('renders all three stat cards', () => {
    render(<StatCards totalSeats={500} reserved={120} cancelled={30} />)

    expect(screen.getByText('Total of seats')).toBeInTheDocument()
    expect(screen.getByText('Reserve')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('displays the correct values', () => {
    render(<StatCards totalSeats={500} reserved={120} cancelled={30} />)

    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<StatCards totalSeats={0} reserved={0} cancelled={0} />)

    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(3)
  })

  it('renders each card as an article', () => {
    render(<StatCards totalSeats={100} reserved={50} cancelled={10} />)

    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(3)
  })
})
