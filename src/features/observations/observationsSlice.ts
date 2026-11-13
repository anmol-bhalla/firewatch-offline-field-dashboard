import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockObservations } from './data/mockObservations'
import { currentTimestamp, generateObservationId } from './observationUtils'
import type { NewObservationInput, Observation, ObservationChanges, ObservationFilters } from './types'

type ObservationsState = {
  items: Observation[]
  filters: ObservationFilters
  selectedObservationId: string | null
}

const initialState: ObservationsState = {
  items: mockObservations,
  filters: { category: 'All', severity: 'All' },
  selectedObservationId: null,
}

const observationsSlice = createSlice({
  name: 'observations',
  initialState,
  reducers: {
    addObservation(state, action: PayloadAction<NewObservationInput>) {
      const timestamp = currentTimestamp()
      state.items.unshift({
        ...action.payload,
        id: generateObservationId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        syncStatus: 'Pending',
      })
    },
    editObservation(state, action: PayloadAction<{ id: string; changes: ObservationChanges }>) {
      const observation = state.items.find((item) => item.id === action.payload.id)
      if (observation) {
        Object.assign(observation, action.payload.changes, {
          updatedAt: currentTimestamp(),
          syncStatus: 'Pending',
        })
      }
    },
    deleteObservation(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
      if (state.selectedObservationId === action.payload) state.selectedObservationId = null
    },
    setSelectedObservation(state, action: PayloadAction<string | null>) {
      state.selectedObservationId = action.payload
    },
    setObservationFilters(state, action: PayloadAction<Partial<ObservationFilters>>) {
      Object.assign(state.filters, action.payload)
    },
    clearObservationFilters(state) {
      state.filters = { category: 'All', severity: 'All' }
    },
  },
})

export const {
  addObservation,
  editObservation,
  deleteObservation,
  setSelectedObservation,
  setObservationFilters,
  clearObservationFilters,
} = observationsSlice.actions

export default observationsSlice.reducer
