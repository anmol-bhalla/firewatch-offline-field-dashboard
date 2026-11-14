import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '../../app/store'
import type { ObservationRepository } from '../../services/db/observationRepository'
import { mockObservations } from '../observations/data/mockObservations'
import { hydrateObservations } from '../observations/observationsSlice'
import type { Observation } from '../observations/types'
import DashboardPage from './DashboardPage'

vi.mock('../map/ObservationMap', () => ({ default: () => <div data-testid="observation-map" /> }))

function makeRepository(getAll: () => Promise<Observation[]>): ObservationRepository {
  return {
    getAll,
    add: vi.fn(async () => undefined),
    update: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
    markPendingAsSimulated: vi.fn(async () => []),
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe('dashboard hydration gating', () => {
  it('shows loading state and disables create and demo sync until hydration completes', async () => {
    const pendingRead = deferred<Observation[]>()
    const store = createAppStore(makeRepository(() => pendingRead.promise))
    const hydration = store.dispatch(hydrateObservations())
    render(<Provider store={store}><DashboardPage /></Provider>)

    expect(screen.getByText('Loading saved observations…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New observation' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Run demo sync/ })).toBeDisabled()

    pendingRead.resolve(mockObservations)
    await hydration
  })

  it('shows hydration errors and enables retry until the database loads successfully', async () => {
    let readCount = 0
    const repository = makeRepository(async () => {
      readCount += 1
      if (readCount === 1) throw new Error('temporary IndexedDB error')
      return mockObservations
    })
    const store = createAppStore(repository)
    await store.dispatch(hydrateObservations())
    render(<Provider store={store}><DashboardPage /></Provider>)
    const user = userEvent.setup()

    expect(screen.getByRole('alert')).toHaveTextContent('Saved observations could not be loaded')
    expect(screen.getByRole('button', { name: 'New observation' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Retry loading' }))

    expect(await screen.findByText('Smoke column observed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New observation' })).toBeEnabled()
    expect(readCount).toBe(2)
  })
})
