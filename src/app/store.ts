import { configureStore } from '@reduxjs/toolkit'
import observationsReducer from '../features/observations/observationsSlice'
import { observationRepository, type ObservationRepository } from '../services/db/observationRepository'

export function createAppStore(repository: ObservationRepository = observationRepository) {
  return configureStore({
    reducer: { observations: observationsReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: { extraArgument: repository } }),
  })
}

export const store = createAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
