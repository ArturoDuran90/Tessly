import { useEffect, useRef, useState } from 'react'
import NavBar from '../components/NavBar'
import HamburgerMenu from '../components/HamburgerMenu'

export default function Map() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const heatLayerRef = useRef(null)
  const tripLayerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('trips')

  useEffect(() => {
    if (mapInstanceRef.current) return
    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView([40.2338, -111.6585], 11)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapInstanceRef.current = map

    const carIcon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#E31937;border-radius:50%;border:2px solid #fff;"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    })

    const tripDotIcon = L.divIcon({
      html: '<div style="width:8px;height:8px;background:#378ADD;border-radius:50%;opacity:0.7;"></div>',
      iconSize: [8, 8], iconAnchor: [4, 4], className: ''
    })

    Promise.all([
      fetch('/api/snapshots/latest').then(r => r.json()),
      fetch('/api/trips').then(r => r.json()),
      fetch('/api/snapshots/heatmap').then(r => r.json())
    ]).then(([snap, trips, heatPoints]) => {
      if (snap?.latitude && snap?.longitude) {
        L.marker([snap.latitude, snap.longitude], { icon: carIcon })
          .addTo(map)
          .bindPopup('<b>Batmobile-3</b><br>' + snap.battery_level + '% battery')
        map.setView([snap.latitude, snap.longitude], 13)
      }

      const tripGroup = L.layerGroup()
      trips.forEach(trip => {
        if (trip.start_lat && trip.start_lng) {
          L.marker([trip.start_lat, trip.start_lng], { icon: tripDotIcon })
            .addTo(tripGroup)
            .bindPopup('Trip · ' + (trip.miles_driven?.toFixed(1) || '--') + ' mi')
        }
        if (trip.end_lat && trip.end_lng) {
          L.marker([trip.end_lat, trip.end_lng], { icon: tripDotIcon }).addTo(tripGroup)
        }
        if (trip.start_lat && trip.end_lat) {
          L.polyline([
            [trip.start_lat, trip.start_lng],
            [trip.end_lat, trip.end_lng]
          ], { color: '#378ADD', weight: 2, opacity: 0.5 }).addTo(tripGroup)
        }
      })
      tripGroup.addTo(map)
      tripLayerRef.current = tripGroup

      if (heatPoints.length > 0 && L.heatLayer) {
        const points = heatPoints.map(p => [p.latitude, p.longitude, 0.5])
        const heat = L.heatLayer(points, { radius: 20, blur: 15, maxZoom: 17, gradient: { 0.4: '#378ADD', 0.6: '#f59e0b', 1.0: '#E31937' } })
        heatLayerRef.current = heat
      }

      setLoading(false)
    }).catch(() => setLoading(false))

    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  function toggleMode(newMode) {
    const map = mapInstanceRef.current
    if (!map) return
    setMode(newMode)
    if (newMode === 'heat') {
      if (tripLayerRef.current) map.removeLayer(tripLayerRef.current)
      if (heatLayerRef.current) heatLayerRef.current.addTo(map)
    } else {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)
      if (tripLayerRef.current) tripLayerRef.current.addTo(map)
    }
  }

  return (
    <div style={{ background: '#0d0d0d', height: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: '18px', fontWeight: 500 }}>Map</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '8px', border: '0.5px solid #2a2a2a', overflow: 'hidden' }}>
            {['trips', 'heat'].map(m => (
              <button key={m} onClick={() => toggleMode(m)} style={{
                padding: '6px 14px', background: mode === m ? '#E31937' : 'none',
                border: 'none', color: mode === m ? '#fff' : '#555',
                fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '.08em'
              }}>{m}</button>
            ))}
          </div>
          <HamburgerMenu />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', marginBottom: '68px' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: '#0d0d0d' }}>
            <div style={{ color: '#555', fontSize: '13px' }}>Loading map...</div>
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <NavBar />
    </div>
  )
}
