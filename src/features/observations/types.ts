export const observationCategories = ['Smoke', 'Fire', 'Hotspot', 'Other'] as const
export type ObservationCategory = (typeof observationCategories)[number]

export const observationSeverities = ['Low', 'Medium', 'High'] as const
export type ObservationSeverity = (typeof observationSeverities)[number]

export type SyncStatus = 'Pending' | 'Synced'

export type Observation = {
  id: string
  title: string
  category: ObservationCategory
  severity: ObservationSeverity
  description: string
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
}

export type NewObservationInput = Pick<
  Observation,
  'title' | 'category' | 'severity' | 'description' | 'latitude' | 'longitude'
>

export type ObservationChanges = NewObservationInput

export type ObservationFilters = {
  category: ObservationCategory | 'All'
  severity: ObservationSeverity | 'All'
}
