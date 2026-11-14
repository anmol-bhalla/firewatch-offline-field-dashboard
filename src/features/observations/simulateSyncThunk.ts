import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { ObservationRepository } from '../../services/db/observationRepository'
import type { Observation } from './types'

export const simulatePendingSync = createAsyncThunk<Observation[], void, { state: RootState; extra: ObservationRepository; rejectValue: string }>(
  'observations/simulateSync',
  async (_, { extra, getState, rejectWithValue }) => {
    if (getState().observations.hydrationStatus !== 'ready') {
      return rejectWithValue('Saved observations are not ready yet. Wait for them to load, then try again.')
    }
    try { return await extra.markPendingAsSimulated() }
    catch { return rejectWithValue('The local demo could not be completed. Pending statuses were not changed.') }
  },
)
