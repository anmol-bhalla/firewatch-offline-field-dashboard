import { useState } from 'react'
import { ArrowDownUp, ArrowRight, MapPin, Pencil, Trash2, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { clearObservationFilters, clearWriteError, deleteObservation, editObservation, setObservationFilters, setSelectedObservation } from '../../observations/observationsSlice'
import { selectFilteredObservations, selectObservationFilters, selectObservations, selectSelectedObservationId } from '../../observations/selectors'
import { formatObservationDate } from '../../observations/observationUtils'
import { observationCategories, observationSeverities, type NewObservationInput, type Observation } from '../../observations/types'
import ObservationForm from '../../observations/components/ObservationForm'

type ObservationListProps = {
  onCreateObservation: () => void
}

export default function ObservationList({ onCreateObservation }: ObservationListProps) {
  const dispatch = useAppDispatch()
  const observations = useAppSelector(selectFilteredObservations)
  const allObservations = useAppSelector(selectObservations)
  const selectedObservationId = useAppSelector(selectSelectedObservationId)
  const filters = useAppSelector(selectObservationFilters)
  const writeError = useAppSelector((state) => state.observations.writeError)
  const observationsReady = useAppSelector((state) => state.observations.hydrationStatus === 'ready')
  const [editing, setEditing] = useState<Observation | undefined>()
  const [failedDeleteId, setFailedDeleteId] = useState<string | null>(null)
  const hasFilters = filters.category !== 'All' || filters.severity !== 'All'

  async function handleSave(input: NewObservationInput) {
    if (editing) {
      await dispatch(editObservation({ id: editing.id, changes: input })).unwrap()
      setEditing(undefined)
    }
  }

  async function handleDelete(id: string) {
    try {
      await dispatch(deleteObservation(id)).unwrap()
      setFailedDeleteId(null)
    } catch {
      setFailedDeleteId(id)
    }
  }

  return (
    <section className="panel observations-panel" aria-labelledby="observations-title">
      <div className="panel-heading observations-heading">
        <div><div className="eyebrow">FIELD REPORTS</div><h2 id="observations-title">Recent observations <span className="heading-count">{observations.length}</span></h2></div>
        <button className="view-all" type="button" disabled={!observationsReady} onClick={onCreateObservation}>New <ArrowRight size={15} /></button>
      </div>
      <div className="observation-filters">
        <label>Category
          <select aria-label="Filter by category" value={filters.category} onChange={(event) => dispatch(setObservationFilters({ category: event.target.value as typeof filters.category }))}>
            <option value="All">All categories</option>{observationCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>Severity
          <select aria-label="Filter by severity" value={filters.severity} onChange={(event) => dispatch(setObservationFilters({ severity: event.target.value as typeof filters.severity }))}>
            <option value="All">All severities</option>{observationSeverities.map((severity) => <option key={severity}>{severity}</option>)}
          </select>
        </label>
        {hasFilters && <button type="button" className="clear-filters" onClick={() => dispatch(clearObservationFilters())}><X size={13} />Clear filters</button>}
      </div>
      {writeError && <div className="storage-error" role="alert"><span>{writeError}</span>{failedDeleteId && <button type="button" className="clear-filters" onClick={() => { dispatch(clearWriteError()); void handleDelete(failedDeleteId) }}>Retry delete</button>}</div>}
      <div className="table-scroll">
        <table>
          <thead><tr><th>OBSERVATION</th><th>CATEGORY</th><th><span className="sortable">SEVERITY <ArrowDownUp size={12} /></span></th><th>REPORTED</th><th>LOCATION</th><th>SYNC</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {observations.map((observation) => (
              <tr key={observation.id} className={selectedObservationId === observation.id ? 'selected-observation-row' : undefined}>
                <td><div className="observation-cell"><span className="observation-pin"><MapPin size={14} /></span><button className="observation-select" type="button" aria-pressed={selectedObservationId === observation.id} onClick={() => dispatch(setSelectedObservation(observation.id))}><span className="observation-info"><strong>{observation.title}</strong><small>{observation.description}</small></span></button></div></td>
                <td><span className={`category-tag ${observation.category.toLowerCase()}`}>{observation.category}</span></td>
                <td><span className={`severity ${observation.severity.toLowerCase()}`}><i />{observation.severity}</span></td>
                <td className="reported-time">{formatObservationDate(observation.createdAt)}</td>
                <td className="coordinate-cell">{observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}</td>
                <td><span className={`sync-status ${observation.syncStatus.toLowerCase()}`}><i />{observation.syncStatus === 'Simulated' ? 'Demo complete' : observation.syncStatus}</span></td>
                <td><div className="row-actions"><button className="row-menu" type="button" aria-label={`Edit ${observation.title}`} disabled={!observationsReady} onClick={() => setEditing(observation)}><Pencil size={14} /></button><button className="row-menu delete-action" type="button" aria-label={`Delete ${observation.title}`} disabled={!observationsReady} onClick={() => { if (window.confirm(`Delete “${observation.title}”? This action cannot be undone.`)) void handleDelete(observation.id) }}><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {observations.length === 0 && <p className="empty-observations">{observationsReady ? 'No observations match these filters.' : 'Saved observations are unavailable until loading completes.'}</p>}
      </div>
      <div className="list-footer">Showing <strong>{observations.length}</strong> of <strong>{allObservations.length}</strong> observations</div>
      {editing && <ObservationForm observation={editing} onCancel={() => setEditing(undefined)} onSave={handleSave} />}
    </section>
  )
}
