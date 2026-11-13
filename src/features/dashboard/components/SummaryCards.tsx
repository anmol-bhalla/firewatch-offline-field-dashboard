import { Activity, AlertTriangle, ClipboardList, CloudUpload } from 'lucide-react'
import { useAppSelector } from '../../../app/hooks'
import { selectDashboardStatistics } from '../../observations/selectors'

export default function SummaryCards() {
  const stats = useAppSelector(selectDashboardStatistics)
  const cards = [
    { label: 'Total observations', value: stats.total, note: 'Across Pacific Region', icon: ClipboardList, tone: 'blue' },
    { label: 'High severity', value: stats.highSeverity, note: 'Require attention', icon: AlertTriangle, tone: 'orange' },
    { label: 'Pending sync', value: stats.pendingSync, note: 'Awaiting sync', icon: CloudUpload, tone: 'purple' },
    { label: 'Recent activity', value: stats.recentActivity, note: 'In the last 24 hours', icon: Activity, tone: 'green' },
  ]

  return (
    <section className="summary-grid" aria-label="Observation summary">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <article className="summary-card" key={label}>
          <div className="summary-top"><span className="summary-label">{label}</span><span className={`summary-icon ${tone}`}><Icon size={18} strokeWidth={1.9} /></span></div>
          <div className="summary-bottom"><strong className="summary-value" aria-label={`${label}: ${value}`}>{value}</strong><span className="summary-note">{note}</span></div>
        </article>
      ))}
    </section>
  )
}
