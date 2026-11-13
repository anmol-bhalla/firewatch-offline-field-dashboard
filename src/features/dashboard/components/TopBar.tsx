import { Bell, Menu, Search } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Navigation is not available yet" disabled><Menu size={20} /></button>
      <div className="breadcrumb"><span>Pacific Region</span><span className="crumb-divider">/</span><strong>Overview</strong></div>
      <div className="topbar-actions">
        <div className="network-pill"><span className="live-dot" />Demo workspace</div>
        <button className="icon-button search-button" aria-label="Search is not available yet" disabled><Search size={18} /></button>
        <button className="icon-button notification-button" aria-label="Notifications are not available yet" disabled><Bell size={18} /></button>
      </div>
    </header>
  )
}
