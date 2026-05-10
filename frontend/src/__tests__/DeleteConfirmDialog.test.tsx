import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteConfirmDialog from '@/app/components/DeleteConfirmDialog'

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    concertName: 'Summer Festival',
    onCancel: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays the concert name in the confirmation message', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)

    expect(screen.getByText(/Summer Festival/)).toBeInTheDocument()
    expect(screen.getByText(/Are you sure to delete/)).toBeInTheDocument()
  })

  it('renders as a dialog', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />)

    await userEvent.click(screen.getByText('Cancel'))

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    expect(defaultProps.onDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete when Yes, Delete button is clicked', async () => {
    render(<DeleteConfirmDialog {...defaultProps} />)

    await userEvent.click(screen.getByText('Yes, Delete'))

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    expect(defaultProps.onCancel).not.toHaveBeenCalled()
  })

  it('shows both Cancel and Delete buttons', () => {
    render(<DeleteConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
  })
})
