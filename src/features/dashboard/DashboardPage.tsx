import { CalendarDays, Plus } from 'lucide-react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SummaryCards from './components/SummaryCards'
import MapPanel from './components/MapPanel'
import ObservationList from './components/ObservationList'

export default function DashboardPage() {
  return (
    <div className="app-shell" id="overview">
      <Sidebar />
      <main className="main-area">
        <TopBar />
        <div className="dashboard-content">
          <div className="page-heading">
            <div><div className="date-label"><span className="date-pip" /> FRIDAY, NOVEMBER 13, 2026 <span className="date-divider">·</span> DEMO PREVIEW</div><h1>Field overview</h1><p>Monitor wildfire observations across your response area.</p></div>
            <div className="page-actions"><span className="date-button"><CalendarDays size={15} /><span>Last 7 days</span></span><button className="primary-button" disabled title="Observation creation will be added in a later phase"><Plus size={17} />New observation</button></div>
          </div>
          <SummaryCards />
          <div className="dashboard-grid"><MapPanel /><ObservationList /></div>
          <footer className="dashboard-footer"><span>FireWatch Field Operations</span><span>Regional coordination dashboard <i /> Pacific Region</span></footer>
        </div>
      </main>
    </div>
  )
}
