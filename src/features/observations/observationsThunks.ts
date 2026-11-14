import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { ObservationRepository } from '../../services/db/observationRepository'
import { currentTimestamp, generateObservationId } from './observationUtils'
import type { NewObservationInput, Observation } from './types'

type ThunkConfig = { state: RootState; extra: ObservationRepository; rejectValue: string }
const createObservationThunk = createAsyncThunk.withTypes<ThunkConfig>()

function friendlyError(action: string): string {
  return `Could not ${action} in local storage. Your dashboard was not changed. Check available device storage and try again.`
}

const hydrationRequiredMessage = 'Saved observations are not ready yet. Wait for them to load, then try again.'

export const hydrateObservations = createObservationThunk<Observation[], void>(
  'observations/hydrate',
  async (_, { extra, rejectWithValue }) => {
    try { return await extra.getAll() }
    catch { return rejectWithValue('Saved observations could not be loaded from this device. Reload to try again.') }
  },
  { condition: (_, { getState }) => ['idle', 'error'].includes(getState().observations.hydrationStatus) },
)

export const addObservation = createObservationThunk<Observation, NewObservationInput>(
  'observations/add',
  async (input, { extra, getState, rejectWithValue }) => {
    if (getState().observations.hydrationStatus !== 'ready') return rejectWithValue(hydrationRequiredMessage)
    const now = currentTimestamp()
    const observation: Observation = { ...input, id: generateObservationId(), createdAt: now, updatedAt: now, syncStatus: 'Pending' }
    try { await extra.add(observation); return observation }
    catch { return rejectWithValue(friendlyError('save this observation')) }
  },
)

export const editObservation = createObservationThunk<Observation, { id: string; changes: NewObservationInput }>(
  'observations/edit',
  async ({ id, changes }, { extra, getState, rejectWithValue }) => {
    if (getState().observations.hydrationStatus !== 'ready') return rejectWithValue(hydrationRequiredMessage)
    const existing = getState().observations.items.find((item) => item.id === id)
    if (!existing) return rejectWithValue('This observation is no longer available. Refresh the list and try again.')
    const updated: Observation = { ...existing, ...changes, updatedAt: currentTimestamp(), syncStatus: 'Pending' }
    try { await extra.update(updated); return updated }
    catch { return rejectWithValue(friendlyError('update this observation')) }
  },
)

export const deleteObservation = createObservationThunk<string, string>(
  'observations/delete',
  async (id, { extra, getState, rejectWithValue }) => {
    if (getState().observations.hydrationStatus !== 'ready') return rejectWithValue(hydrationRequiredMessage)
    try { await extra.delete(id); return id }
    catch { return rejectWithValue(friendlyError('delete this observation')) }
  },
)
