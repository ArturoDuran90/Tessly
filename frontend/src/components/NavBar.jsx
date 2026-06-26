import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', icon: 'ti-home', label: 'Home' },
  { path: '/trips', icon: 'ti-route', label: 'Trips' },
  { path: '/charging', icon: 'ti-bolt', label: 'Charging' },
  { path: '/stats', icon: 'ti-chart-bar', label: 'Stats' },
  { path: '/map', icon: 'ti-map', label: 'Map' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111', borderTop: '0.5px solid #222',
      display: 'flex', justifyContent: 'space-around',
      padding: '12px 0 28px', zIndex: 100
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', fontSize: '9px', background: 'none', border: 'none',
              color: active ? '#E31937' : '#555', cursor: 'pointer', padding: '0 8px'
            }}>
            <i className={'ti ' + tab.icon} style={{ fontSize: '20px' }} aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
