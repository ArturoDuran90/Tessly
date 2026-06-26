import { useState } from 'react'
import NavBar from '../components/NavBar'

export default function Settings() {
  const [rate, setRate] = useState('0.12')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    localStorage.setItem('electricity_rate', rate)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 500 }}>Settings</div>
      </div>

      <div style={{ padding: '0 16px' }}>

        <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '16px', border: '0.5px solid #2a2a2a', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Electricity rate</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#888', fontSize: '16px' }}>$</span>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={e => setRate(e.target.value)}
              style={{
                background: '#111', border: '0.5px solid #333', borderRadius: '8px',
                color: '#fff', fontSize: '16px', padding: '8px 12px', width: '100px',
                fontFamily: 'monospace', outline: 'none'
              }}
            />
            <span style={{ color: '#555', fontSize: '13px' }}>per kWh</span>
          </div>
          <div style={{ fontSize: '11px', color: '#444', marginTop: '8px' }}>
            Used to calculate charging costs
          </div>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '16px', border: '0.5px solid #2a2a2a', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Vehicle</div>
          <div style={{ fontSize: '14px', color: '#888' }}>Batmobile-3</div>
          <div style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>2020 Tesla Model 3</div>
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '16px', border: '0.5px solid #2a2a2a', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>About</div>
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
            Tessly — self-hosted Tesla dashboard<br />
            Running on TrueNAS SCALE<br />
            Polls every 5 minutes
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: saved ? '#1a3a1a' : '#1a1a1a',
            border: saved ? '0.5px solid #22c55e' : '0.5px solid #E31937',
            color: saved ? '#22c55e' : '#E31937',
            fontSize: '14px', fontFamily: 'monospace', cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>

      <NavBar />
    </div>
  )
}
