import { Crosshair, Layers, MapPin, Plus, Minus } from 'lucide-react'

const markers = [
  { left: '31%', top: '38%', tone: 'orange', count: '3' },
  { left: '51%', top: '30%', tone: 'red', count: '!' },
  { left: '65%', top: '55%', tone: 'blue', count: '2' },
  { left: '42%', top: '68%', tone: 'orange', count: '!' },
  { left: '76%', top: '36%', tone: 'blue', count: '4' },
]

export default function MapPanel() {
  return (
    <section className="panel map-panel" aria-labelledby="map-title">
      <div className="panel-heading map-heading">
        <div><div className="eyebrow">LIVE FIELD VIEW</div><h2 id="map-title">Observation map</h2></div>
        <button className="text-button" disabled title="Map layers are not available in this foundation build"><Layers size={15} /> Layers</button>
      </div>
      <div className="map-canvas" role="img" aria-label="Map placeholder for observations around Greater Victoria and southern Vancouver Island">
        <div className="map-grid" />
        <div className="map-water water-one" /><div className="map-water water-two" />
        <div className="map-land land-one" /><div className="map-land land-two" /><div className="map-land land-three" />
        <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
        <span className="map-label label-victoria">VICTORIA</span><span className="map-label label-sooke">SOOKE</span><span className="map-label label-malahat">MALAHAT</span><span className="map-label label-gulf">JUAN DE FUCA STRAIT</span>
        {markers.map((marker, index) => <span className={`map-marker ${marker.tone}`} key={`${marker.left}-${index}`} style={{ left: marker.left, top: marker.top }}>{marker.count}</span>)}
        <div className="map-controls"><button aria-label="Zoom in (map not connected)" disabled><Plus size={15} /></button><button aria-label="Zoom out (map not connected)" disabled><Minus size={15} /></button><button aria-label="Center map (map not connected)" disabled><Crosshair size={15} /></button></div>
        <div className="map-placeholder-note"><MapPin size={14} /> Mapbox map will appear here</div>
      </div>
      <div className="map-legend"><span><i className="legend-dot critical" />High severity</span><span><i className="legend-dot moderate" />Medium severity</span><span><i className="legend-dot low" />Low severity</span><span className="map-region">Greater Victoria, BC <span>·</span> 48.4284° N, 123.3656° W</span></div>
    </section>
  )
}
