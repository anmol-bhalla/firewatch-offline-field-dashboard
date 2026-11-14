import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectObservations = (state: RootState) => state.observations.items
export const selectObservationFilters = (state: RootState) => state.observations.filters
export const selectSelectedObservationId = (state: RootState) => state.observations.selectedObservationId
export const selectHydrationStatus = (state: RootState) => state.observations.hydrationStatus
export const selectHydrationError = (state: RootState) => state.observations.hydrationError
export const selectWriteError = (state: RootState) => state.observations.writeError

export const selectFilteredObservations = createSelector(
  [selectObservations, selectObservationFilters],
  (observations, filters) => observations.filter((observation) =>
    (filters.category === 'All' || observation.category === filters.category)
    && (filters.severity === 'All' || observation.severity === filters.severity),
  ),
)

export const selectDashboardStatistics = createSelector([selectObservations], (observations) => {
  const recentCutoff = Date.now() - 24 * 60 * 60 * 1000

  return {
    total: observations.length,
    highSeverity: observations.filter((observation) => observation.severity === 'High').length,
    pendingSync: observations.filter((observation) => observation.syncStatus === 'Pending').length,
    recentActivity: observations.filter((observation) => Date.parse(observation.updatedAt) >= recentCutoff).length,
  }
})
