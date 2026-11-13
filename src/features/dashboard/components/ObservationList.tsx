import { ArrowDownUp, ArrowRight, MoreHorizontal } from 'lucide-react'
import { mockObservations } from '../data/mockObservations'

export default function ObservationList() {
  return (
    <section className="panel observations-panel" aria-labelledby="observations-title">
      <div className="panel-heading observations-heading">
        <div><div className="eyebrow">FIELD REPORTS</div><h2 id="observations-title">Recent observations <span className="heading-count">12</span></h2></div>
        <button className="view-all" disabled title="Observation browsing will be added in a later phase">View all <ArrowRight size={15} /></button>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>OBSERVATION</th><th>CATEGORY</th><th><span className="sortable">SEVERITY <ArrowDownUp size={12} /></span></th><th>REPORTED</th><th>SYNC</th><th><span className="sr-only">More actions</span></th></tr></thead>
          <tbody>
            {mockObservations.map((observation) => (
              <tr key={observation.id}>
                <td><div className="observation-cell"><span className={`observer-avatar ${observation.color}`}>{observation.initials}</span><span className="observation-info"><strong>{observation.title}</strong><small>{observation.location} <span>· {observation.id}</span></small></span></div></td>
                <td><span className="category-tag">{observation.category}</span></td>
                <td><span className={`severity ${observation.severity.toLowerCase()}`}><i />{observation.severity}</span></td>
                <td className="reported-time">Today, {observation.observedAt}</td>
                <td><span className={`sync-status ${observation.status === 'Pending sync' ? 'pending' : 'synced'}`}><i />{observation.status}</span></td>
                <td><button className="row-menu" aria-label={`Actions for ${observation.title} are not available yet`} disabled><MoreHorizontal size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="list-footer">Showing <strong>4</strong> of <strong>12</strong> observations <span>Static preview</span></div>
    </section>
  )
}
