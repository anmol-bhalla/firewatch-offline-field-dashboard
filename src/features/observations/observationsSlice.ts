import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Observation, ObservationFilters } from './types'
import { addObservation, deleteObservation, editObservation, hydrateObservations } from './observationsThunks'
import { simulatePendingSync } from './simulateSyncThunk'

export type ObservationsState = {
  items: Observation[]
  filters: ObservationFilters
  selectedObservationId: string | null
  hydrationStatus: 'idle' | 'loading' | 'ready' | 'error'
  hydrationError: string | null
  pendingWrites: number
  writeError: string | null
}

const initialState: ObservationsState = {
  items: [],
  filters: { category: 'All', severity: 'All' },
  selectedObservationId: null,
  hydrationStatus: 'idle',
  hydrationError: null,
  pendingWrites: 0,
  writeError: null,
}

const observationsSlice = createSlice({
  name: 'observations',
  initialState,
  reducers: {
    setObservationFilters(state, action: PayloadAction<Partial<ObservationFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearObservationFilters(state) {
      state.filters = { category: 'All', severity: 'All' }
    },
    setSelectedObservation(state, action: PayloadAction<string | null>) {
      state.selectedObservationId = action.payload
    },
    clearWriteError(state) {
      state.writeError = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(hydrateObservations.pending, (state) => { state.hydrationStatus = 'loading'; state.hydrationError = null })
      .addCase(hydrateObservations.fulfilled, (state, action) => { state.items = action.payload; state.hydrationStatus = 'ready' })
      .addCase(hydrateObservations.rejected, (state, action) => {
        if (action.meta.condition) return
        state.hydrationStatus = 'error'
        state.hydrationError = action.payload ?? 'Saved observations could not be loaded.'
      })
      .addCase(addObservation.pending, (state) => { state.pendingWrites += 1; state.writeError = null })
      .addCase(addObservation.fulfilled, (state, action) => { state.pendingWrites -= 1; state.items.unshift(action.payload) })
      .addCase(addObservation.rejected, (state, action) => { state.pendingWrites -= 1; state.writeError = action.payload ?? 'The observation could not be saved.' })
      .addCase(editObservation.pending, (state) => { state.pendingWrites += 1; state.writeError = null })
      .addCase(editObservation.fulfilled, (state, action) => {
        state.pendingWrites -= 1
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
      })
      .addCase(editObservation.rejected, (state, action) => { state.pendingWrites -= 1; state.writeError = action.payload ?? 'The observation could not be updated.' })
      .addCase(deleteObservation.pending, (state) => { state.pendingWrites += 1; state.writeError = null })
      .addCase(deleteObservation.fulfilled, (state, action) => {
        state.pendingWrites -= 1
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.selectedObservationId === action.payload) state.selectedObservationId = null
      })
      .addCase(deleteObservation.rejected, (state, action) => { state.pendingWrites -= 1; state.writeError = action.payload ?? 'The observation could not be deleted.' })
      .addCase(simulatePendingSync.pending, (state) => { state.pendingWrites += 1; state.writeError = null })
      .addCase(simulatePendingSync.fulfilled, (state, action) => {
        state.pendingWrites -= 1
        const changed = new Map(action.payload.map((item) => [item.id, item]))
        state.items = state.items.map((item) => changed.get(item.id) ?? item)
      })
      .addCase(simulatePendingSync.rejected, (state, action) => { state.pendingWrites -= 1; state.writeError = action.payload ?? 'The demo could not be completed.' })
  },
})

export const { setObservationFilters, clearObservationFilters, setSelectedObservation, clearWriteError } = observationsSlice.actions
export { addObservation, editObservation, deleteObservation, hydrateObservations, simulatePendingSync }
export default observationsSlice.reducer
