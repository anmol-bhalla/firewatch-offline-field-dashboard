import { Activity, AlertTriangle, ClipboardList, CloudUpload } from 'lucide-react'

const cards = [
  { label: 'Total observations', value: '128', note: 'Across Pacific Region', icon: ClipboardList, tone: 'blue' },
  { label: 'High severity', value: '08', note: '3 require attention', icon: AlertTriangle, tone: 'orange' },
  { label: 'Pending sync', value: '03', note: 'Awaiting connection', icon: CloudUpload, tone: 'purple' },
  { label: 'Recent activity', value: '24', note: 'In the last 24 hours', icon: Activity, tone: 'green' },
]

export default function SummaryCards() {
  return (
    <section className="summary-grid" aria-label="Observation summary">
      {cards.map(({ label, value, note, icon: Icon, tone }) => (
        <article className="summary-card" key={label}>
          <div className="summary-top"><span className="summary-label">{label}</span><span className={`summary-icon ${tone}`}><Icon size={18} strokeWidth={1.9} /></span></div>
          <div className="summary-bottom"><strong className="summary-value">{value}</strong><span className="summary-note">{note}</span></div>
        </article>
      ))}
    </section>
  )
}
