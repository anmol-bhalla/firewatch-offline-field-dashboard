import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PwaUpdatePrompt from './PwaUpdatePrompt'

const { useRegisterSWMock } = vi.hoisted(() => ({ useRegisterSWMock: vi.fn() }))
vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: useRegisterSWMock }))

describe('PwaUpdatePrompt', () => {
  const setNeedRefresh = vi.fn()
  const setOfflineReady = vi.fn()
  const updateServiceWorker = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useRegisterSWMock.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      offlineReady: [false, setOfflineReady],
      updateServiceWorker,
    })
  })

  it('dismisses the notice through both PWA hook state callbacks', async () => {
    const user = userEvent.setup()
    render(<PwaUpdatePrompt />)

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }))

    expect(setNeedRefresh).toHaveBeenCalledWith(false)
    expect(setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('preserves the update action', async () => {
    const user = userEvent.setup()
    render(<PwaUpdatePrompt />)

    await user.click(screen.getByRole('button', { name: 'Reload to update' }))

    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
