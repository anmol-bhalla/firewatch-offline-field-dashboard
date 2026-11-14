import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { hydrateObservations } from '../features/observations/observationsSlice'
import DashboardPage from '../features/dashboard/DashboardPage'
import PwaUpdatePrompt from './PwaUpdatePrompt'

export default function App() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.observations.hydrationStatus)

  useEffect(() => {
    if (status === 'idle') void dispatch(hydrateObservations())
  }, [dispatch, status])

  return <><DashboardPage /><PwaUpdatePrompt /></>
}
