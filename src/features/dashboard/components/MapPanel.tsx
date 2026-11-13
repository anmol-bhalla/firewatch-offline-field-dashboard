import { useCallback } from 'react'
import { Layers } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import ObservationMap from '../../map/ObservationMap'
import { selectObservations, selectSelectedObservationId } from '../../observations/selectors'
import { setSelectedObservation } from '../../observations/observationsSlice'
import type { ObservationCoordinates } from '../../observations/types'

type MapPanelProps = {
  selectedCoordinates: ObservationCoordinates | null
  onLocationSelect: (coordinates: ObservationCoordinates) => void
}

export default function MapPanel({ selectedCoordinates, onLocationSelect }: MapPanelProps) {
  const dispatch = useAppDispatch()
  const observations = useAppSelector(selectObservations)
  const selectedObservationId = useAppSelector(selectSelectedObservationId)

  const handleObservationSelect = useCallback((id: string) => {
    dispatch(setSelectedObservation(id))
  }, [dispatch])

  return (
    <section className="panel map-panel" aria-labelledby="map-title">
      <div className="panel-heading map-heading">
        <div><div className="eyebrow">LIVE FIELD VIEW</div><h2 id="map-title">Observation map</h2></div>
        <button className="text-button" disabled title="Map layers are not available yet"><Layers size={15} /> Layers</button>
      </div>
      <ObservationMap
        accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        observations={observations}
        selectedObservationId={selectedObservationId}
        selectedCoordinates={selectedCoordinates}
        onObservationSelect={handleObservationSelect}
        onLocationSelect={onLocationSelect}
      />
      <div className="map-legend">
        <span><i className="legend-dot critical" />High severity</span>
        <span><i className="legend-dot moderate" />Medium severity</span>
        <span><i className="legend-dot low" />Low severity</span>
        {selectedCoordinates
          ? <span className="map-region selected-coordinates">Selected: {selectedCoordinates.latitude.toFixed(4)}, {selectedCoordinates.longitude.toFixed(4)}</span>
          : <span className="map-region">Greater Victoria, BC <span>·</span> 48.4284° N, 123.3656° W</span>}
      </div>
    </section>
  )
}
