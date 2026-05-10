import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '@/app/components/Toast'

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the message text', () => {
    render(<Toast message="Reserve successfully" onClose={jest.fn()} />)
    expect(screen.getByText('Reserve successfully')).toBeInTheDocument()
  })

  it('renders as success style by default', () => {
    render(<Toast message="Done" onClose={jest.fn()} />)
    const container = screen.getByRole('status')
    expect(container.className).toContain('bg-[#d0e7d2]')
  })

  it('renders as error style when type is error', () => {
    render(<Toast message="Something failed" type="error" onClose={jest.fn()} />)
    const container = screen.getByRole('status')
    expect(container.className).toContain('bg-[#f8d7da]')
  })

  it('auto-closes after 3 seconds', () => {
    const onClose = jest.fn()
    render(<Toast message="Bye" onClose={onClose} />)

    expect(onClose).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', async () => {
    jest.useRealTimers()
    const onClose = jest.fn()
    render(<Toast message="Click me" onClose={onClose} />)

    const closeBtn = screen.getByRole('button', { name: /close notification/i })
    await userEvent.click(closeBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
