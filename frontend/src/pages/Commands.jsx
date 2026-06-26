import { useState } from 'react'
import NavBar from '../components/NavBar'
import HamburgerMenu from '../components/HamburgerMenu'

const VEHICLE_ID = '1492934466759526'

function CommandButton({ icon, label, sub, onClick, loading, success, danger }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      width: '100%', padding: '14px 16px', background: '#1a1a1a',
      border: success ? '0.5px solid #22c55e' : danger ? '0.5px solid #E31937' : '0.5px solid #2a2a2a',
      borderRadius: '14px', color: success ? '#22c55e' : '#fff',
      cursor: loading ? 'wait' : 'pointer', fontFamily: 'monospace',
      marginBottom: '10px', textAlign: 'left', transition: 'all 0.2s',
      opacity: loading ? 0.7 : 1
    }}>
      <i className={'ti ' + icon} style={{ fontSize: '22px', color: success ? '#22c55e' : '#666', flexShrink: 0 }} aria-hidden="true" />
      <div>
        <div style={{ fontSize: '14px' }}>{loading ? 'Sending...' : label}</div>
        {sub && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</div>}
      </div>
    </button>
  )
}

export default function Commands() {
  const [states, setStates] = useState({})

  async function sendCommand(name, endpoint, method = 'POST', body = {}) {
    setStates(s => ({ ...s, [name]: 'loading' }))
    try {
      const token = localStorage.getItem('tessly_token')
      const res = await fetch('/api/commands/' + endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ vehicle_id: VEHICLE_ID, ...body })
      })
      const data = await res.json()
      setStates(s => ({ ...s, [name]: data.ok ? 'success' : 'error' }))
      setTimeout(() => setStates(s => ({ ...s, [name]: null })), 3000)
    } catch {
      setStates(s => ({ ...s, [name]: 'error' }))
      setTimeout(() => setStates(s => ({ ...s, [name]: null })), 3000)
    }
  }

  const cmd = (name, endpoint, body) => ({
    loading: states[name] === 'loading',
    success: states[name] === 'success',
    danger: states[name] === 'error',
    onClick: () => sendCommand(name, endpoint, 'POST', body)
  })

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 8px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>Commands</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>Batmobile-3 must be awake</div>
        </div>
        <HamburgerMenu />
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '10px' }}>Doors</div>
        <CommandButton icon="ti-lock" label="Lock doors" {...cmd('lock', 'lock')} />
        <CommandButton icon="ti-lock-open" label="Unlock doors" {...cmd('unlock', 'unlock')} />

        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', margin: '16px 0 10px' }}>Climate</div>
        <CommandButton icon="ti-wind" label="Start climate" sub="Uses last set temperature" {...cmd('climate_on', 'climate_on')} />
        <CommandButton icon="ti-wind-off" label="Stop climate" {...cmd('climate_off', 'climate_off')} />

        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', margin: '16px 0 10px' }}>Charging</div>
        <CommandButton icon="ti-bolt" label="Start charging" {...cmd('charge_start', 'charge_start')} />
        <CommandButton icon="ti-bolt-off" label="Stop charging" {...cmd('charge_stop', 'charge_stop')} />

        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', margin: '16px 0 10px' }}>Signal</div>
        <CommandButton icon="ti-speakerphone" label="Honk horn" {...cmd('honk', 'honk')} />
        <CommandButton icon="ti-bulb" label="Flash lights" {...cmd('flash', 'flash_lights')} />
      </div>

      <NavBar />
    </div>
  )
}
