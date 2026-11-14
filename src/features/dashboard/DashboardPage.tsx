import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addObservation, hydrateObservations } from '../observations/observationsSlice'
import ObservationForm from '../observations/components/ObservationForm'
import type { NewObservationInput, ObservationCoordinates } from '../observations/types'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SummaryCards from './components/SummaryCards'
import MapPanel from './components/MapPanel'
import ObservationList from './components/ObservationList'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const hydrationStatus = useAppSelector((state) => state.observations.hydrationStatus)
  const hydrationError = useAppSelector((state) => state.observations.hydrationError)
  const observationsReady = hydrationStatus === 'ready'
  const [isCreating, setIsCreating] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<ObservationCoordinates | null>(null)

  async function handleCreate(observation: NewObservationInput) {
    await dispatch(addObservation(observation)).unwrap()
    setIsCreating(false)
    setSelectedCoordinates(null)
  }

  return (
    <div className="app-shell" id="overview">
      <Sidebar />
      <main className="main-area">
        <TopBar />
        <div className="dashboard-content">
          <div className="page-heading">
            <div><div className="date-label"><span className="date-pip" /> FRIDAY, NOVEMBER 13, 2026 <span className="date-divider">·</span> DEMO PREVIEW</div><h1>Field overview</h1><p>Monitor wildfire observations across your response area.</p></div>
            <div className="page-actions"><span className="date-button"><CalendarDays size={15} /><span>Last 7 days</span></span><button className="primary-button" type="button" disabled={!observationsReady} onClick={() => setIsCreating(true)}><Plus size={17} />New observation</button></div>
          </div>
          {hydrationStatus === 'loading' && <p className="hydration-message" role="status">Loading saved observations…</p>}
          {hydrationError && <div className="storage-error" role="alert"><span>{hydrationError}</span><button type="button" className="clear-filters" disabled={hydrationStatus === 'loading'} onClick={() => { void dispatch(hydrateObservations()) }}>Retry loading</button></div>}
          <SummaryCards />
          <div className="dashboard-grid">
            <MapPanel selectedCoordinates={selectedCoordinates} onLocationSelect={setSelectedCoordinates} />
            <ObservationList onCreateObservation={() => setIsCreating(true)} />
          </div>
          <footer className="dashboard-footer"><span>FireWatch Field Operations</span><span>Regional coordination dashboard <i /> Pacific Region</span></footer>
        </div>
        {isCreating && <ObservationForm initialCoordinates={selectedCoordinates} onCancel={() => setIsCreating(false)} onSave={handleCreate} />}
      </main>
    </div>
  )
}
