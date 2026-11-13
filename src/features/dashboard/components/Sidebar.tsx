import { Activity, ChevronDown, CircleHelp, Flame, Layers2, Map, Settings2, ShieldCheck } from 'lucide-react'
import { useAppSelector } from '../../../app/hooks'
import { selectObservations } from '../../observations/selectors'

const navigation = [
  { label: 'Overview', icon: Map, active: true },
  { label: 'Observations', icon: Activity },
  { label: 'Map layers', icon: Layers2 },
]

export default function Sidebar() {
  const observationCount = useAppSelector(selectObservations).length

  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="FireWatch home">
        <span className="brand-mark"><Flame size={21} strokeWidth={2.3} /></span>
        <span><strong>FIREWATCH</strong><small>FIELD OPERATIONS</small></span>
      </a>

      <button className="team-switcher" disabled title="Team switching is not available in this preview">
        <span className="team-avatar"><ShieldCheck size={17} /></span>
        <span className="team-copy"><strong>Pacific Region</strong><small>Response team</small></span>
        <ChevronDown size={15} className="muted-icon" />
      </button>

      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, active }) => active ? (
          <a key={label} href="#overview" className="nav-link active" aria-current="page">
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
          </a>
        ) : (
          <span key={label} className="nav-link unavailable">
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === 'Observations' && <span className="nav-count">{observationCount}</span>}
          </span>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status"><span className="live-dot" /><span><strong>Demo workspace</strong><small>Static preview data</small></span></div>
        <span className="nav-link unavailable"><CircleHelp size={17} /><span>Help & resources</span></span>
        <span className="nav-link unavailable"><Settings2 size={17} /><span>Settings</span></span>
        <div className="user-profile"><div className="profile-avatar">JM</div><span><strong>Jordan Miller</strong><small>Field coordinator</small></span><ChevronDown size={15} className="muted-icon" /></div>
      </div>
    </aside>
  )
}
