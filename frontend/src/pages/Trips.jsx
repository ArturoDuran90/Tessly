import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'

function TripRow({ trip }) {
  const date = new Date(trip.started_at)
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const miles = trip.miles_driven ? trip.miles_driven.toFixed(1) : '--'
  const apMiles = trip.autopilot_miles ? trip.autopilot_miles.toFixed(1) : '0'
  const apPct = trip.autopilot_pct ? trip.autopilot_pct + '%' : '0%'

  const durationMs = new Date(trip.ended_at) - new Date(trip.started_at)
  const mins = Math.round(durationMs / 60000)
  const duration = mins < 60 ? mins + ' min' : (mins / 60).toFixed(1) + ' hr'

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: '14px',
      padding: '14px 16px', border: '0.5px solid #2a2a2a', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '16px', color: '#fff' }}>{miles} mi</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>{dateStr} · {timeStr}</div>
        </div>
        <div style={{ fontSize: '13px', color: '#888' }}>{duration}</div>
      </div>
      <div style={{ borderTop: '0.5px solid #2a2a2a', paddingTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.08em' }}>Autopilot</div>
          <div style={{ fontSize: '12px', color: parseFloat(apPct) > 0 ? '#378ADD' : '#444' }}>
            {apMiles} mi · {apPct}
          </div>
        </div>
        <div style={{ background: '#111', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
          <div style={{
            background: '#378ADD', height: '100%', borderRadius: '4px',
            width: apPct, transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/trips').then(r => r.json()),
      fetch('/api/trips/stats').then(r => r.json())
    ]).then(([t, s]) => {
      setTrips(t)
      setStats(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 500 }}>Trips</div>
        {stats && (
          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
            {stats.total_trips} trips · {stats.total_miles || 0} total miles
          </div>
        )}
      </div>

      {stats && stats.total_trips > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px 16px' }}>
          <StatCard label="Total miles" value={stats.total_miles || '--'} />
          <StatCard label="AP usage" value={stats.ap_pct ? stats.ap_pct + '%' : '--'} sub="of all miles" />
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        {loading && <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', paddingTop: '40px' }}>Loading...</div>}
        {!loading && trips.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <i className="ti ti-route" style={{ fontSize: '40px', color: '#333' }} aria-hidden="true" />
            <div style={{ color: '#555', fontSize: '13px', marginTop: '12px' }}>No trips recorded yet</div>
            <div style={{ color: '#444', fontSize: '11px', marginTop: '4px' }}>Drive your car to log a trip</div>
          </div>
        )}
        {trips.map(trip => <TripRow key={trip.id} trip={trip} />)}
      </div>

      <NavBar />
    </div>
  )
}
