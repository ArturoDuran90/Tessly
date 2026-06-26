import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import NavBar from '../components/NavBar'
import HamburgerMenu from '../components/HamburgerMenu'

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', color: '#fff' }}>{value ?? '--'}</div>
      {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
      <div style={{ color: '#888', marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Stats() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const current = data[0] || {}
  const chartData = [...data].reverse()

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>Monthly stats</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>Last 12 months</div>
        </div>
        <HamburgerMenu />
      </div>

      {loading && <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', paddingTop: '60px' }}>Loading...</div>}

      {!loading && data.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
          <i className="ti ti-chart-bar" style={{ fontSize: '40px', color: '#333' }} aria-hidden="true" />
          <div style={{ color: '#555', fontSize: '13px', marginTop: '12px' }}>No data yet</div>
          <div style={{ color: '#444', fontSize: '11px', marginTop: '4px' }}>Drive and charge your car to see stats</div>
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          <div style={{ padding: '8px 16px 0', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>
            {current.label}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 16px 16px' }}>
            <StatCard label="Miles" value={current.miles} />
            <StatCard label="Trips" value={current.trips} />
            <StatCard label="kWh added" value={current.kwh} />
            <StatCard label="Charge cost" value={current.cost ? '$' + current.cost : '--'} />
            <StatCard label="AP usage" value={current.ap_pct ? current.ap_pct + '%' : '--'} sub="of miles" />
            <StatCard label="Avg battery" value={current.avg_battery ? current.avg_battery + '%' : '--'} />
          </div>

          {chartData.length > 1 && (
            <>
              <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Miles per month</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="miles" fill="#E31937" radius={[4, 4, 0, 0]} name="miles" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Charging cost per month</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="cost $" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ margin: '0 16px 12px', background: '#1a1a1a', borderRadius: '14px', padding: '14px', border: '0.5px solid #2a2a2a' }}>
                <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '12px' }}>Autopilot % per month</div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="ap_pct" stroke="#378ADD" strokeWidth={2} dot={false} name="AP %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      <NavBar />
    </div>
  )
}
