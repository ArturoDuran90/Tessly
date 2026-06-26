import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function go(path) {
    setOpen(false)
    navigate(path)
  }

  function signOut() {
    localStorage.removeItem('tessly_token')
    window.location.reload()
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
        aria-label="Menu">
        <i className="ti ti-menu-2" style={{ fontSize: '22px' }} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', right: 0, top: '36px', zIndex: 100,
            background: '#1a1a1a', border: '0.5px solid #2a2a2a',
            borderRadius: '12px', padding: '8px', minWidth: '160px'
          }}>
            <button onClick={() => go('/commands')} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', background: 'none',
              border: 'none', color: '#ccc', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'monospace', borderRadius: '8px', textAlign: 'left'
            }}>
              <i className="ti ti-terminal" style={{ fontSize: '16px', color: '#666' }} aria-hidden="true" />
              Commands
            </button>
            <button onClick={() => go('/settings')} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', background: 'none',
              border: 'none', color: '#ccc', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'monospace', borderRadius: '8px', textAlign: 'left'
            }}>
              <i className="ti ti-settings" style={{ fontSize: '16px', color: '#666' }} aria-hidden="true" />
              Settings
            </button>
            <div style={{ borderTop: '0.5px solid #2a2a2a', margin: '4px 0' }} />
            <button onClick={signOut} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', background: 'none',
              border: 'none', color: '#E31937', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'monospace', borderRadius: '8px', textAlign: 'left'
            }}>
              <i className="ti ti-logout" style={{ fontSize: '16px' }} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
