import { useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap, MapMouseEvent, Marker as MapboxMarker, Popup as MapboxPopup } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Observation, ObservationCoordinates } from '../observations/types'

type MapStatus = 'loading' | 'ready' | 'missing-token' | 'error'
type MapboxGL = typeof import('mapbox-gl').default

type ObservationMapProps = {
  accessToken?: string
  observations: Observation[]
  selectedObservationId: string | null
  selectedCoordinates: ObservationCoordinates | null
  onObservationSelect: (id: string) => void
  onLocationSelect: (coordinates: ObservationCoordinates) => void
}

type MarkerRecord = {
  marker: MapboxMarker
  popup: MapboxPopup
  element: HTMLButtonElement
  clickHandler: () => void
}

function createPopupContent(observation: Observation): HTMLElement {
  const content = document.createElement('div')
  content.className = 'observation-popup'

  const title = document.createElement('strong')
  title.textContent = observation.title
  const detail = document.createElement('span')
  detail.textContent = `${observation.category} · ${observation.severity} severity`
  const coordinates = document.createElement('small')
  coordinates.textContent = `${observation.latitude.toFixed(4)}, ${observation.longitude.toFixed(4)}`

  content.append(title, detail, coordinates)
  return content
}

function createObservationMarkerElement(observation: Observation): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = `observation-map-marker severity-${observation.severity.toLowerCase()}`
  element.setAttribute('aria-label', `${observation.severity} severity: ${observation.title}`)
  element.setAttribute('aria-pressed', 'false')
  const pin = document.createElement('span')
  pin.className = 'observation-marker-pin'
  const halo = document.createElement('span')
  halo.className = 'observation-marker-halo'
  const dot = document.createElement('span')
  dot.className = 'observation-marker-dot'
  pin.append(halo, dot)
  element.append(pin)
  return element
}

export default function ObservationMap({
  accessToken,
  observations,
  selectedObservationId,
  selectedCoordinates,
  onObservationSelect,
  onLocationSelect,
}: ObservationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const mapboxRef = useRef<MapboxGL | null>(null)
  const markersRef = useRef(new Map<string, MarkerRecord>())
  const selectedLocationMarkerRef = useRef<MapboxMarker | null>(null)
  const onObservationSelectRef = useRef(onObservationSelect)
  const onLocationSelectRef = useRef(onLocationSelect)
  const [status, setStatus] = useState<MapStatus>('loading')

  onObservationSelectRef.current = onObservationSelect
  onLocationSelectRef.current = onLocationSelect

  useEffect(() => {
    if (!accessToken) {
      setStatus('missing-token')
      return
    }

    const container = containerRef.current
    if (!container) return

    setStatus('loading')
    const markerRecords = markersRef.current
    let cancelled = false
    let map: MapboxMap | null = null
    let resizeObserver: ResizeObserver | undefined
    let handleMapClick: ((event: MapMouseEvent) => void) | undefined
    let handleLoad: (() => void) | undefined
    let handleError: (() => void) | undefined

    void import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled) return
      try {
        mapboxRef.current = mapboxgl
        map = new mapboxgl.Map({
          accessToken,
          container,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-123.3656, 48.4284],
          zoom: 11,
          attributionControl: true,
        })
        mapRef.current = map
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

        handleMapClick = (event: MapMouseEvent) => {
          onLocationSelectRef.current({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
        }
        handleLoad = () => setStatus('ready')
        handleError = () => setStatus('error')
        map.on('click', handleMapClick)
        map.on('load', handleLoad)
        map.on('error', handleError)

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => map?.resize())
          resizeObserver.observe(container)
        }
      } catch {
        map?.remove()
        mapRef.current = null
        setStatus('error')
      }
    }).catch(() => {
      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      if (map && handleMapClick && handleLoad && handleError) {
        map.off('click', handleMapClick)
        map.off('load', handleLoad)
        map.off('error', handleError)
      }
      for (const { marker, popup } of markerRecords.values()) {
        marker.remove()
        popup.remove()
      }
      markerRecords.clear()
      selectedLocationMarkerRef.current?.remove()
      selectedLocationMarkerRef.current = null
      map?.remove()
      if (mapRef.current === map) mapRef.current = null
      mapboxRef.current = null
    }
  }, [accessToken])

  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = mapboxRef.current
    if (!map || !mapboxgl || status !== 'ready') return

    const activeIds = new Set(observations.map((observation) => observation.id))
    for (const observation of observations) {
      let record = markersRef.current.get(observation.id)
      if (!record) {
        const element = createObservationMarkerElement(observation)
        const clickHandler = () => onObservationSelectRef.current(observation.id)
        element.addEventListener('click', clickHandler)
        const popup = new mapboxgl.Popup({ offset: 18, closeButton: true }).setDOMContent(createPopupContent(observation))
        const marker = new mapboxgl.Marker({ element, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
          .setLngLat([observation.longitude, observation.latitude])
          .setPopup(popup)
          .addTo(map)
        record = { marker, popup, element, clickHandler }
        markersRef.current.set(observation.id, record)
      } else {
        record.marker.setLngLat([observation.longitude, observation.latitude])
        record.popup.setDOMContent(createPopupContent(observation))
        record.element.className = `observation-map-marker severity-${observation.severity.toLowerCase()}`
        record.element.setAttribute('aria-label', `${observation.severity} severity: ${observation.title}`)
      }

      const selected = observation.id === selectedObservationId
      record.element.classList.toggle('selected', selected)
      record.element.setAttribute('aria-pressed', String(selected))
    }

    for (const [id, record] of markersRef.current) {
      if (!activeIds.has(id)) {
        record.element.removeEventListener('click', record.clickHandler)
        record.marker.remove()
        record.popup.remove()
        markersRef.current.delete(id)
      }
    }
  }, [observations, selectedObservationId, status])

  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = mapboxRef.current
    if (!map || !mapboxgl || status !== 'ready') return
    if (!selectedCoordinates) {
      selectedLocationMarkerRef.current?.remove()
      selectedLocationMarkerRef.current = null
      return
    }

    if (!selectedLocationMarkerRef.current) {
      const element = document.createElement('div')
      element.className = 'selected-location-marker'
      element.setAttribute('aria-label', 'Selected observation location')
      const pin = document.createElement('span')
      pin.className = 'selected-location-pin'
      element.append(pin)
      selectedLocationMarkerRef.current = new mapboxgl.Marker({ element, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
        .setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
        .addTo(map)
      return
    }
    selectedLocationMarkerRef.current.setLngLat([selectedCoordinates.longitude, selectedCoordinates.latitude])
  }, [selectedCoordinates, status])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready' || !selectedObservationId) return
    const observation = observations.find((item) => item.id === selectedObservationId)
    const marker = markersRef.current.get(selectedObservationId)
    if (!observation || !marker) return

    map.flyTo({ center: [observation.longitude, observation.latitude], zoom: Math.max(map.getZoom(), 13), essential: true })
    if (!marker.marker.getPopup()?.isOpen()) marker.marker.togglePopup()
  }, [observations, selectedObservationId, status])

  return (
    <div className="map-renderer">
      <div ref={containerRef} className="mapbox-canvas" aria-label="Interactive wildfire observation map" />
      {status === 'loading' && <div className="map-state loading" role="status"><span className="map-spinner" />Loading Victoria map…</div>}
      {status === 'missing-token' && <div className="map-state" role="status"><strong>Mapbox token required</strong><span>Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to your local <code>.env</code> file to load the map.</span></div>}
      {status === 'error' && <div className="map-state map-error" role="alert"><strong>Map could not be loaded</strong><span>Check the access token and network connection. Observation reports remain available.</span></div>}
      {status === 'ready' && observations.length === 0 && <div className="map-empty-state" role="status">No observations yet. Click the map to choose a report location.</div>}
      {status === 'ready' && observations.length > 0 && <div className="map-click-hint">Click map, then New observation to report here</div>}
    </div>
  )
}
