import { configureStore } from '@reduxjs/toolkit'
import observationsReducer from '../features/observations/observationsSlice'

export const store = configureStore({
  reducer: {
    observations: observationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
