import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import NavBar from '../components/NavBar'
import HamburgerMenu from '../components/HamburgerMenu'

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#fff' }}>
      <div style={{ color: '#E31937', fontWeight: 500 }}>{payload[0].value}%</div>
      <div style={{ color: '#555', marginTop: '2px' }}>{payload[0].payload.time}</div>
    </div>
  )
}

export default function Dashboard() {
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [apStats, setApStats] = useState(null)
  const [healthStats, setHealthStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/snapshots/latest')
        .then(r => r.json())
        .then(data => setSnapshot(data))
        .catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/snapshots/latest')
      .then(r => r.json())
      .then(data => { setSnapshot(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch('/api/battery-health/stats')
      .then(r => r.json())
      .then(data => setHealthStats(data))
      .catch(() => {})

    fetch('/api/trips/stats')
      .then(r => r.json())
      .then(data => setApStats(data))
      .catch(() => {})

    fetch('/api/snapshots/history')
      .then(r => r.json())
      .then(data => {
        const formatted = data.reverse().map(s => ({
          battery: s.battery_level,
          time: new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        setHistory(formatted)
      })
      .catch(() => {})
  }, [])

  const tempF = snapshot?.outside_temp != null
    ? Math.round(snapshot.outside_temp * 9/5 + 32) + '\u00b0F'
    : '--'

  const odometer = snapshot?.odometer
    ? Math.round(snapshot.odometer).toLocaleString()
    : '--'

  const range = snapshot?.rated_range
    ? Math.round(snapshot.rated_range) + ' mi'
    : '--'

  const battery = snapshot?.battery_level ?? '--'

  const estimatedFullRange = snapshot?.rated_range && snapshot?.battery_level
    ? Math.round(snapshot.rated_range / snapshot.battery_level * 100)
    : null
  const healthPct = healthStats?.current_health ? parseFloat(healthStats.current_health).toFixed(1) : null

  const lastSeen = snapshot?.recorded_at
    ? new Date(snapshot.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>{snapshot?.display_name || 'Batmobile-3'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', marginTop: '3px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: loading ? '#555' : snapshot ? '#22c55e' : '#555' }} />
            {loading ? 'Loading...' : snapshot ? 'Online' : 'Offline'}
          </div>
        </div>
        <HamburgerMenu />
      </div>

      <div style={{ textAlign: 'center', padding: '20px 20px 8px' }}>
        <div style={{ fontSize: '80px', fontWeight: 300, letterSpacing: '-4px', lineHeight: 1 }}>
          {battery}<span style={{ fontSize: '28px', color: '#888', verticalAlign: 'top', marginTop: '14px', display: 'inline-block' }}>%</span>
        </div>
        <div style={{ fontSize: '13px', color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: '8px' }}>estimated range</div>
        <div style={{ fontSize: '22px', marginTop: '4px' }}>{range}</div>
      </div>

      <div style={{ margin: '4px 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '12px 16px', border: '0.5px solid #2a2a2a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em' }}>Charge</div>
            {healthPct && (
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em' }}>Battery health</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '28px', color: battery > 20 ? '#22c55e' : '#E31937' }}>{battery}%</div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{estimatedFullRange} mi at 100%</div>
            </div>
            {healthPct && (
              <div style={{ borderLeft: '0.5px solid #2a2a2a', paddingLeft: '16px' }}>
                <div style={{ fontSize: '28px', color: parseFloat(healthPct) > 80 ? '#22c55e' : parseFloat(healthPct) > 70 ? '#f59e0b' : '#E31937' }}>{healthPct}%</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{healthStats?.current_range} of 315 mi</div>
              </div>
            )}
          </div>
          <div style={{ background: '#111', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              background: battery > 20 ? '#22c55e' : '#E31937',
              height: '100%', borderRadius: '4px',
              width: battery + '%', transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

      {history.length > 1 && (
        <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Battery history</div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={history}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="battery" stroke="#E31937" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#E31937' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px 12px' }}>
        <StatCard label="Odometer" value={odometer} sub="miles" />
        <StatCard label="Outside temp" value={tempF} />
      </div>

      {apStats && apStats.total_trips > 0 && (
        <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px 16px', border: '0.5px solid #2a2a2a' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Autopilot lifetime</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '20px', color: '#378ADD' }}>{apStats.ap_pct || 0}%</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{apStats.total_ap_miles || 0} of {apStats.total_miles || 0} mi</div>
          </div>
          <div style={{ background: '#111', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#378ADD', height: '100%', borderRadius: '4px', width: (apStats.ap_pct || 0) + '%' }} />
          </div>
        </div>
      )}

      {snapshot?.is_plugged_in && (
        <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px 16px', border: '0.5px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>
              {snapshot.is_charging ? 'Charging' : 'Plugged in'}
            </div>
            <div style={{ fontSize: '16px', color: snapshot.is_charging ? '#f59e0b' : '#22c55e' }}>
              {snapshot.is_charging ? 'Charging now' : 'Not charging'}
            </div>
          </div>
          <i className="ti ti-bolt" style={{ fontSize: '28px', color: snapshot.is_charging ? '#f59e0b' : '#555' }} aria-hidden="true" />
        </div>
      )}

      {lastSeen && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#444', paddingTop: '4px' }}>
          Last updated {lastSeen}
        </div>
      )}

      <NavBar />
    </div>
  )
}
