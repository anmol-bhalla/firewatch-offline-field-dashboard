import { Bell, CloudUpload, Menu, Search, Wifi, WifiOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { useOnlineStatus } from '../../../app/useOnlineStatus'
import { simulatePendingSync } from '../../observations/observationsSlice'

export default function TopBar() {
  const dispatch = useAppDispatch()
  const isOnline = useOnlineStatus()
  const pendingCount = useAppSelector((state) => state.observations.items.filter((item) => item.syncStatus === 'Pending').length)
  const isWriting = useAppSelector((state) => state.observations.pendingWrites > 0)
  const observationsReady = useAppSelector((state) => state.observations.hydrationStatus === 'ready')

  async function runDemo() {
    await dispatch(simulatePendingSync()).unwrap()
  }

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Navigation is not available yet" disabled><Menu size={20} /></button>
      <div className="breadcrumb"><span>Pacific Region</span><span className="crumb-divider">/</span><strong>Overview</strong></div>
      <div className="topbar-actions">
        <div className={`network-pill ${isOnline ? 'online' : 'offline'}`} role="status" aria-label={isOnline ? 'Application appears online' : 'Application is offline'}>{isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}{isOnline ? 'Online' : 'Offline'}</div>
        <button className="demo-sync-button" type="button" disabled={!observationsReady || pendingCount === 0 || isWriting} onClick={() => { void runDemo().catch(() => undefined) }} title="Marks pending items Demo complete locally; no server is contacted"><CloudUpload size={14} />Run demo sync ({pendingCount})</button>
        <button className="icon-button search-button" aria-label="Search is not available yet" disabled><Search size={18} /></button>
        <button className="icon-button notification-button" aria-label="Notifications are not available yet" disabled><Bell size={18} /></button>
      </div>
    </header>
  )
}
