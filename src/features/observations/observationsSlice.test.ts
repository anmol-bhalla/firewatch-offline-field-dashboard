import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockObservations } from './data/mockObservations'
import { addObservation, deleteObservation, editObservation, setObservationFilters } from './observationsSlice'
import { selectDashboardStatistics, selectFilteredObservations } from './selectors'
import type { NewObservationInput } from './types'
import observationsReducer from './observationsSlice'

const draft: NewObservationInput = {
  title: 'New smoke report',
  category: 'Smoke',
  severity: 'Medium',
  description: 'A thin smoke plume is visible from the access road.',
  latitude: 48.4,
  longitude: -123.3,
}

function createTestStore() {
  return configureStore({ reducer: { observations: observationsReducer } })
}

afterEach(() => vi.useRealTimers())

describe('observations reducers', () => {
  it('adds an observation with an id, timestamps, and pending sync status', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T18:00:00.000Z'))
    const store = createTestStore()

    store.dispatch(addObservation(draft))

    const added = store.getState().observations.items[0]
    expect(added).toMatchObject({ ...draft, createdAt: '2026-11-13T18:00:00.000Z', updatedAt: '2026-11-13T18:00:00.000Z', syncStatus: 'Pending' })
    expect(added?.id).toMatch(/^FW-/)
  })

  it('updates observation fields and updatedAt when edited', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T19:00:00.000Z'))
    const store = createTestStore()
    const original = mockObservations[0]
    expect(original).toBeDefined()
    if (!original) return

    store.dispatch(editObservation({ id: original.id, changes: { ...draft, title: 'Smoke updated' } }))

    expect(store.getState().observations.items[0]).toMatchObject({ title: 'Smoke updated', createdAt: original.createdAt, updatedAt: '2026-11-13T19:00:00.000Z', syncStatus: 'Pending' })
  })

  it('deletes an observation by id', () => {
    const store = createTestStore()
    store.dispatch(deleteObservation('FW-2481'))

    expect(store.getState().observations.items).toHaveLength(3)
    expect(store.getState().observations.items.some((observation) => observation.id === 'FW-2481')).toBe(false)
  })

  it('filters by category and severity together', () => {
    const store = createTestStore()
    store.dispatch(setObservationFilters({ category: 'Smoke' }))
    store.dispatch(setObservationFilters({ severity: 'High' }))

    expect(selectFilteredObservations(store.getState()).map((observation) => observation.id)).toEqual(['FW-2481'])
  })

  it('derives dashboard statistics from observations', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T20:00:00.000Z'))
    const store = createTestStore()

    expect(selectDashboardStatistics(store.getState())).toEqual({ total: 4, highSeverity: 2, pendingSync: 2, recentActivity: 4 })
  })
})
