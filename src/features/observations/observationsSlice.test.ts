import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '../../app/store'
import type { ObservationRepository } from '../../services/db/observationRepository'
import { mockObservations } from './data/mockObservations'
import { addObservation, deleteObservation, editObservation, hydrateObservations, setObservationFilters, simulatePendingSync } from './observationsSlice'
import { selectDashboardStatistics, selectFilteredObservations } from './selectors'
import type { Observation, NewObservationInput } from './types'

const draft: NewObservationInput = { title: 'New smoke report', category: 'Smoke', severity: 'Medium', description: 'A thin plume is visible from the access road.', latitude: 48.4, longitude: -123.3 }

function createRepository(seed = mockObservations): ObservationRepository {
  const rows = new Map(seed.map((item) => [item.id, structuredClone(item)]))
  return {
    getAll: async () => [...rows.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    add: async (item) => { rows.set(item.id, structuredClone(item)) },
    update: async (item) => { if (!rows.has(item.id)) throw new Error('missing'); rows.set(item.id, structuredClone(item)) },
    delete: async (id) => { rows.delete(id) },
    markPendingAsSimulated: async () => {
      const updated = [...rows.values()].filter((item) => item.syncStatus === 'Pending').map((item) => ({ ...item, syncStatus: 'Simulated' as const }))
      updated.forEach((item) => rows.set(item.id, item))
      return updated
    },
  }
}

function createTestStore(repository = createRepository()) {
  const store = createAppStore(repository)
  return { store, ready: store.dispatch(hydrateObservations()) }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

afterEach(() => vi.useRealTimers())

describe('observations async Redux state', () => {
  it('hydrates observations and adds only after repository persistence succeeds', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T18:00:00.000Z'))
    const { store, ready } = createTestStore()
    await ready
    const result = await store.dispatch(addObservation(draft))
    expect(addObservation.fulfilled.match(result)).toBe(true)
    expect(store.getState().observations.items[0]).toMatchObject({ ...draft, createdAt: '2026-11-13T18:00:00.000Z', updatedAt: '2026-11-13T18:00:00.000Z', syncStatus: 'Pending' })
    expect(store.getState().observations.items[0]?.id).toMatch(/^FW-/)
    expect(store.getState().observations.hydrationStatus).toBe('ready')
  })

  it('updates persisted fields and updatedAt when edited', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T19:00:00.000Z'))
    const { store, ready } = createTestStore()
    await ready
    const original = mockObservations[0] as Observation
    await store.dispatch(editObservation({ id: original.id, changes: { ...draft, title: 'Smoke updated' } }))
    expect(store.getState().observations.items.find((item) => item.id === original.id)).toMatchObject({ title: 'Smoke updated', createdAt: original.createdAt, updatedAt: '2026-11-13T19:00:00.000Z', syncStatus: 'Pending' })
  })

  it('deletes from persisted state', async () => {
    const { store, ready } = createTestStore()
    await ready
    await store.dispatch(deleteObservation('FW-2481'))
    expect(store.getState().observations.items).toHaveLength(3)
  })

  it('leaves Redux unchanged and exposes an error when a write fails', async () => {
    const repo = createRepository()
    vi.spyOn(repo, 'add').mockRejectedValue(new Error('quota'))
    const { store, ready } = createTestStore(repo)
    await ready
    const before = store.getState().observations.items
    const result = await store.dispatch(addObservation(draft))
    expect(addObservation.rejected.match(result)).toBe(true)
    expect(store.getState().observations.items).toEqual(before)
    expect(store.getState().observations.writeError).toMatch(/local storage/)
  })

  it('rejects every observation write and demo action while hydration is loading', async () => {
    const pendingRead = deferred<Observation[]>()
    const repository = createRepository()
    vi.spyOn(repository, 'getAll').mockReturnValue(pendingRead.promise)
    vi.spyOn(repository, 'add')
    vi.spyOn(repository, 'update')
    vi.spyOn(repository, 'delete')
    vi.spyOn(repository, 'markPendingAsSimulated')
    const { store } = createTestStore(repository)
    const hydration = store.dispatch(hydrateObservations())
    expect(store.getState().observations.hydrationStatus).toBe('loading')

    const actions = await Promise.all([
      store.dispatch(addObservation(draft)),
      store.dispatch(editObservation({ id: 'FW-2481', changes: draft })),
      store.dispatch(deleteObservation('FW-2481')),
      store.dispatch(simulatePendingSync()),
    ])
    expect(actions.every((action) => action.meta.requestStatus === 'rejected')).toBe(true)
    expect(actions.map((action) => action.payload)).toEqual(Array(4).fill('Saved observations are not ready yet. Wait for them to load, then try again.'))
    expect(repository.add).not.toHaveBeenCalled()
    expect(repository.update).not.toHaveBeenCalled()
    expect(repository.delete).not.toHaveBeenCalled()
    expect(repository.markPendingAsSimulated).not.toHaveBeenCalled()

    pendingRead.resolve(mockObservations)
    await hydration
  })

  it('keeps writes guarded after hydration fails', async () => {
    const repository = createRepository()
    vi.spyOn(repository, 'getAll').mockRejectedValue(new Error('IndexedDB unavailable'))
    vi.spyOn(repository, 'add')
    const { store, ready } = createTestStore(repository)
    await ready
    expect(store.getState().observations.hydrationStatus).toBe('error')
    expect(store.getState().observations.hydrationError).toMatch(/could not be loaded/i)

    const result = await store.dispatch(addObservation(draft))
    expect(addObservation.rejected.match(result)).toBe(true)
    expect(repository.add).not.toHaveBeenCalled()
    expect(store.getState().observations.items).toEqual([])
  })

  it('allows CRUD after a successful hydration retry', async () => {
    const repository = createRepository()
    vi.spyOn(repository, 'getAll')
      .mockRejectedValueOnce(new Error('Temporary read failure'))
      .mockImplementation(async () => [...mockObservations])
    const { store, ready } = createTestStore(repository)
    await ready
    expect(store.getState().observations.hydrationStatus).toBe('error')

    await store.dispatch(hydrateObservations()).unwrap()
    expect(store.getState().observations.hydrationStatus).toBe('ready')
    const result = await store.dispatch(addObservation(draft))
    expect(addObservation.fulfilled.match(result)).toBe(true)
    expect(store.getState().observations.items).toHaveLength(mockObservations.length + 1)
  })

  it('marks pending items as demo complete and persists that local status', async () => {
    const repository = createRepository()
    const { store, ready } = createTestStore(repository)
    await ready
    await store.dispatch(simulatePendingSync()).unwrap()
    expect(store.getState().observations.items.every((item) => item.syncStatus === 'Simulated')).toBe(true)
    expect((await repository.getAll()).every((item) => item.syncStatus === 'Simulated')).toBe(true)
  })

  it('filters by category and severity and derives dashboard statistics', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T20:00:00.000Z'))
    const { store, ready } = createTestStore()
    await ready
    store.dispatch(setObservationFilters({ category: 'Smoke', severity: 'High' }))
    expect(selectFilteredObservations(store.getState()).map((item) => item.id)).toEqual(['FW-2481'])
    expect(selectDashboardStatistics(store.getState())).toEqual({ total: 4, highSeverity: 2, pendingSync: 2, recentActivity: 4 })
  })
})
