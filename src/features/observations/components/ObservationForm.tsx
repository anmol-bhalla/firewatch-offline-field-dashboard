import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { observationCategories, observationSeverities, type NewObservationInput, type Observation, type ObservationCoordinates } from '../types'

type ObservationFormProps = {
  observation?: Observation
  initialCoordinates?: ObservationCoordinates | null
  onCancel: () => void
  onSave: (observation: NewObservationInput) => Promise<void>
}

export default function ObservationForm({ observation, initialCoordinates, onCancel, onSave }: ObservationFormProps) {
  const [title, setTitle] = useState(observation?.title ?? '')
  const [category, setCategory] = useState<NewObservationInput['category']>(observation?.category ?? 'Smoke')
  const [severity, setSeverity] = useState<NewObservationInput['severity']>(observation?.severity ?? 'Low')
  const [description, setDescription] = useState(observation?.description ?? '')
  const [latitude, setLatitude] = useState(observation ? String(observation.latitude) : initialCoordinates ? String(initialCoordinates.latitude) : '')
  const [longitude, setLongitude] = useState(observation ? String(observation.longitude) : initialCoordinates ? String(initialCoordinates.longitude) : '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedLatitude = Number(latitude)
    const parsedLongitude = Number(longitude)

    if (!title.trim() || !description.trim()) {
      setError('Enter a title and description.')
      return
    }
    if (!latitude.trim() || !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      setError('Latitude must be a number between -90 and 90.')
      return
    }
    if (!longitude.trim() || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
      setError('Longitude must be a number between -180 and 180.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await onSave({ title: title.trim(), category, severity, description: description.trim(), latitude: parsedLatitude, longitude: parsedLongitude })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The observation could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
      <section className="observation-dialog" role="dialog" aria-modal="true" aria-labelledby="observation-form-title">
        <div className="dialog-heading">
          <div><div className="eyebrow">FIELD REPORT</div><h2 id="observation-form-title">{observation ? 'Edit observation' : 'New observation'}</h2></div>
          <button className="dialog-close" type="button" onClick={onCancel} aria-label="Close form"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label className="form-field full-width">Title
            <input autoFocus name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={100} placeholder="e.g. Smoke visible near ridge" />
          </label>
          <div className="form-row">
            <label className="form-field">Observation category
              <select name="category" value={category} onChange={(event) => setCategory(event.target.value as NewObservationInput['category'])}>
                {observationCategories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="form-field">Observation severity
              <select name="severity" value={severity} onChange={(event) => setSeverity(event.target.value as NewObservationInput['severity'])}>
                {observationSeverities.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label className="form-field full-width">Description
            <textarea name="description" value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={500} rows={3} placeholder="Describe what you observed..." />
          </label>
          <div className="form-row">
            <label className="form-field">Latitude
              <input name="latitude" type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required placeholder="48.4284" />
            </label>
            <label className="form-field">Longitude
              <input name="longitude" type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required placeholder="-123.3656" />
            </label>
          </div>
          {!observation && initialCoordinates && <p className="map-coordinate-note">Coordinates filled from the selected map location.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onCancel} disabled={isSaving}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving…' : observation ? 'Save changes' : 'Add observation'}</button></div>
        </form>
      </section>
    </div>
  )
}
