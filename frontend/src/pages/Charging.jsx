import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'

function SessionRow({ session }) {
  const date = new Date(session.started_at)
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const durationMs = new Date(session.ended_at) - new Date(session.started_at)
  const mins = Math.round(durationMs / 60000)
  const duration = mins < 60 ? mins + ' min' : (mins / 60).toFixed(1) + ' hr'

  const kwh = session.kwh_added ? parseFloat(session.kwh_added).toFixed(2) : '--'
  const cost = session.cost_usd ? '$' + parseFloat(session.cost_usd).toFixed(2) : '--'

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: '14px',
      padding: '14px 16px', border: '0.5px solid #2a2a2a', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 400 }}>{kwh} kWh</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>{dateStr} · {timeStr}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', color: '#888' }}>{cost}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>{duration}</div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#1a1a1a', borderRadius: '14px',
      padding: '14px', border: '0.5px solid #2a2a2a'
    }}>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

export default function Charging() {
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/charging').then(r => r.json()),
      fetch('/api/charging/stats').then(r => r.json())
    ]).then(([s, st]) => {
      setSessions(s)
      setStats(st)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 500 }}>Charging</div>
        {stats && (
          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
            {stats.total_sessions} sessions recorded
          </div>
        )}
      </div>

      {stats && stats.total_sessions > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px 16px' }}>
          <StatCard label="Total kWh" value={stats.total_kwh || '--'} sub="energy added" />
          <StatCard label="Total cost" value={stats.total_cost ? '$' + stats.total_cost : '--'} sub="at your rate" />
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        {loading && <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', paddingTop: '40px' }}>Loading...</div>}
        {!loading && sessions.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <i className="ti ti-bolt" style={{ fontSize: '40px', color: '#333' }} aria-hidden="true" />
            <div style={{ color: '#555', fontSize: '13px', marginTop: '12px' }}>No charging sessions yet</div>
            <div style={{ color: '#444', fontSize: '11px', marginTop: '4px' }}>Plug in your car to log a session</div>
          </div>
        )}
        {sessions.map(session => <SessionRow key={session.id} session={session} />)}
      </div>

      <NavBar />
    </div>
  )
}
