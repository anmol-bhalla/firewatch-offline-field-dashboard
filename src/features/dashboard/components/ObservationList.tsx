import { useState } from 'react'
import { ArrowDownUp, ArrowRight, MapPin, Pencil, Trash2, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { clearObservationFilters, deleteObservation, editObservation, setObservationFilters, addObservation } from '../../observations/observationsSlice'
import { selectFilteredObservations, selectObservationFilters, selectObservations } from '../../observations/selectors'
import { formatObservationDate } from '../../observations/observationUtils'
import { observationCategories, observationSeverities, type NewObservationInput, type Observation } from '../../observations/types'
import ObservationForm from '../../observations/components/ObservationForm'

export default function ObservationList() {
  const dispatch = useAppDispatch()
  const observations = useAppSelector(selectFilteredObservations)
  const allObservations = useAppSelector(selectObservations)
  const filters = useAppSelector(selectObservationFilters)
  const [editing, setEditing] = useState<Observation | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const hasFilters = filters.category !== 'All' || filters.severity !== 'All'

  function handleSave(input: NewObservationInput) {
    if (editing) {
      dispatch(editObservation({ id: editing.id, changes: input }))
      setEditing(undefined)
    } else {
      dispatch(addObservation(input))
      setIsCreating(false)
    }
  }

  return (
    <section className="panel observations-panel" aria-labelledby="observations-title">
      <div className="panel-heading observations-heading">
        <div><div className="eyebrow">FIELD REPORTS</div><h2 id="observations-title">Recent observations <span className="heading-count">{observations.length}</span></h2></div>
        <button className="view-all" type="button" onClick={() => setIsCreating(true)}>New <ArrowRight size={15} /></button>
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
      <div className="table-scroll">
        <table>
          <thead><tr><th>OBSERVATION</th><th>CATEGORY</th><th><span className="sortable">SEVERITY <ArrowDownUp size={12} /></span></th><th>REPORTED</th><th>LOCATION</th><th>SYNC</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {observations.map((observation) => (
              <tr key={observation.id}>
                <td><div className="observation-cell"><span className="observation-pin"><MapPin size={14} /></span><span className="observation-info"><strong>{observation.title}</strong><small>{observation.description}</small></span></div></td>
                <td><span className={`category-tag ${observation.category.toLowerCase()}`}>{observation.category}</span></td>
                <td><span className={`severity ${observation.severity.toLowerCase()}`}><i />{observation.severity}</span></td>
                <td className="reported-time">{formatObservationDate(observation.createdAt)}</td>
                <td className="coordinate-cell">{observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}</td>
                <td><span className={`sync-status ${observation.syncStatus.toLowerCase()}`}><i />{observation.syncStatus}</span></td>
                <td><div className="row-actions"><button className="row-menu" type="button" aria-label={`Edit ${observation.title}`} onClick={() => setEditing(observation)}><Pencil size={14} /></button><button className="row-menu delete-action" type="button" aria-label={`Delete ${observation.title}`} onClick={() => { if (window.confirm(`Delete “${observation.title}”? This action cannot be undone.`)) dispatch(deleteObservation(observation.id)) }}><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {observations.length === 0 && <p className="empty-observations">No observations match these filters.</p>}
      </div>
      <div className="list-footer">Showing <strong>{observations.length}</strong> of <strong>{allObservations.length}</strong> observations</div>
      {(isCreating || editing) && <ObservationForm observation={editing} onCancel={() => { setIsCreating(false); setEditing(undefined) }} onSave={handleSave} />}
    </section>
  )
}
