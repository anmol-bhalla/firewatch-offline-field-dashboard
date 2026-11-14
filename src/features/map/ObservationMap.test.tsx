import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ObservationMap from './ObservationMap'
import type { Observation } from '../observations/types'

const mapboxMocks = vi.hoisted(() => {
  type MapEvent = { lngLat: { lat: number; lng: number } }
  type Handler = (event?: MapEvent) => void
  const maps: MockMap[] = []
  const markers: MockMarker[] = []
  const handlers = new Map<string, Handler>()

  class MockPopup {
    element: HTMLElement | null = null
    open = false
    setDOMContent = vi.fn((element: HTMLElement) => { this.element = element; return this })
    remove = vi.fn(() => { this.open = false })
    isOpen = vi.fn(() => this.open)
  }

  class MockMarker {
    element: HTMLElement
    popup: MockPopup | null = null
    coordinates: [number, number] = [0, 0]
    setLngLat = vi.fn((coordinates: [number, number]) => { this.coordinates = coordinates; return this })
    setPopup = vi.fn((popup: MockPopup) => { this.popup = popup; return this })
    addTo = vi.fn(() => this)
    remove = vi.fn(() => this)
    getPopup = vi.fn(() => this.popup)
    togglePopup = vi.fn(() => { if (this.popup) this.popup.open = !this.popup.open; return this })

    constructor(options: { element: HTMLElement }) {
      this.element = options.element
      markers.push(this)
    }
  }

  class MockMap {
    options: Record<string, unknown>
    on = vi.fn((event: string, handler: Handler) => { handlers.set(event, handler); return this })
    off = vi.fn((event: string) => { handlers.delete(event); return this })
    addControl = vi.fn(() => this)
    resize = vi.fn(() => this)
    remove = vi.fn(() => this)
    getZoom = vi.fn(() => 11)
    flyTo = vi.fn(() => this)

    constructor(options: Record<string, unknown>) {
      this.options = options
      maps.push(this)
    }
  }

  class MockNavigationControl {
    options: { showCompass: boolean }
    constructor(options: { showCompass: boolean }) { this.options = options }
  }

  return {
    maps,
    markers,
    handlers,
    MockMap,
    MockMarker,
    MockPopup,
    MockNavigationControl,
    reset() {
      maps.length = 0
      markers.length = 0
      handlers.clear()
    },
  }
})

vi.mock('mapbox-gl', () => ({
  default: {
    Map: mapboxMocks.MockMap,
    Marker: mapboxMocks.MockMarker,
    Popup: mapboxMocks.MockPopup,
    NavigationControl: mapboxMocks.MockNavigationControl,
  },
}))

const observations: Observation[] = [
  {
    id: 'FW-1', title: 'Smoke near Sooke', category: 'Smoke', severity: 'High',
    description: 'Gray smoke visible above the ridge.', latitude: 48.4, longitude: -123.7,
    createdAt: '2026-11-13T17:00:00.000Z', updatedAt: '2026-11-13T17:00:00.000Z', syncStatus: 'Pending',
  },
  {
    id: 'FW-2', title: 'Warm ground patch', category: 'Hotspot', severity: 'Medium',
    description: 'Thermal hotspot found during patrol.', latitude: 48.5, longitude: -123.5,
    createdAt: '2026-11-13T16:00:00.000Z', updatedAt: '2026-11-13T16:00:00.000Z', syncStatus: 'Simulated',
  },
]

function renderMap(overrides: Partial<ComponentProps<typeof ObservationMap>> = {}) {
  const onObservationSelect = vi.fn()
  const onLocationSelect = vi.fn()
  const props: ComponentProps<typeof ObservationMap> = {
    accessToken: 'pk.test-token',
    observations,
    selectedObservationId: null,
    selectedCoordinates: null,
    onObservationSelect,
    onLocationSelect,
    ...overrides,
  }
  return { ...render(<ObservationMap {...props} />), onObservationSelect, onLocationSelect, props }
}

beforeEach(() => mapboxMocks.reset())

describe('ObservationMap', () => {
  it('explains missing configuration without initializing Mapbox', () => {
    renderMap({ accessToken: undefined })

    expect(screen.getByRole('status')).toHaveTextContent('Mapbox token required')
    expect(mapboxMocks.maps).toHaveLength(0)
  })

  it('creates severity markers, emits map coordinates, and focuses selected observations', async () => {
    const { onObservationSelect, onLocationSelect, rerender, props, unmount } = renderMap()
    await waitFor(() => expect(mapboxMocks.maps).toHaveLength(1))
    const map = mapboxMocks.maps[0]
    expect(map?.options).toMatchObject({ center: [-123.3656, 48.4284], zoom: 11, accessToken: 'pk.test-token' })
    expect(map?.options['style']).toBe('mapbox://styles/mapbox/light-v11')

    act(() => mapboxMocks.handlers.get('load')?.())

    const observationMarkers = mapboxMocks.markers.filter((marker) => marker.element.classList.contains('observation-map-marker'))
    expect(observationMarkers).toHaveLength(2)
    expect(observationMarkers[0]?.element).toHaveClass('severity-high')
    expect(observationMarkers[1]?.element).toHaveClass('severity-medium')

    fireEvent.click(observationMarkers[0]!.element)
    expect(onObservationSelect).toHaveBeenCalledWith('FW-1')
    act(() => mapboxMocks.handlers.get('click')?.({ lngLat: { lat: 48.51, lng: -123.44 } }))
    const pickedLocation = { latitude: 48.51, longitude: -123.44 }
    expect(onLocationSelect).toHaveBeenCalledWith(pickedLocation)

    rerender(<ObservationMap {...props} selectedCoordinates={pickedLocation} />)
    const locationMarker = mapboxMocks.markers.find((marker) => marker.element.classList.contains('selected-location-marker'))
    expect(locationMarker?.coordinates).toEqual([-123.44, 48.51])
    expect(locationMarker?.setLngLat.mock.invocationCallOrder[0]).toBeLessThan(locationMarker?.addTo.mock.invocationCallOrder[0] ?? 0)

    rerender(<ObservationMap {...props} selectedObservationId="FW-1" />)
    expect(map?.flyTo).toHaveBeenCalledWith({ center: [-123.7, 48.4], zoom: 13, essential: true })
    expect(observationMarkers[0]?.element).toHaveClass('selected')

    const updatedObservation = { ...observations[0]!, severity: 'Low' as const, latitude: 48.41, longitude: -123.71 }
    rerender(<ObservationMap {...props} observations={[updatedObservation, observations[1]!]} selectedObservationId="FW-1" />)
    expect(observationMarkers[0]?.element).toHaveClass('severity-low')
    expect(observationMarkers[0]?.setLngLat).toHaveBeenLastCalledWith([-123.71, 48.41])

    rerender(<ObservationMap {...props} observations={[updatedObservation]} selectedObservationId="FW-1" />)
    expect(observationMarkers[1]?.remove).toHaveBeenCalledOnce()
    unmount()
    expect(map?.remove).toHaveBeenCalledOnce()
  })

  it('shows a map error state when Mapbox reports a loading failure', async () => {
    renderMap()
    await waitFor(() => expect(mapboxMocks.maps).toHaveLength(1))
    act(() => mapboxMocks.handlers.get('error')?.())

    expect(screen.getByRole('alert')).toHaveTextContent('Map could not be loaded')
  })
})
