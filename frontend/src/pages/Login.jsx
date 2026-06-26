import { useState } from 'react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('tessly_token', data.token)
        onLogin()
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: '#0d0d0d', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace'
    }}>
      <div style={{ width: '100%', maxWidth: '320px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', color: '#E31937', marginBottom: '8px' }}>
            <i className="ti ti-car" aria-hidden="true" />
          </div>
          <div style={{ fontSize: '20px', color: '#fff', fontWeight: 500 }}>Tessly</div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>Batmobile-3 dashboard</div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', background: '#1a1a1a',
              border: error ? '0.5px solid #E31937' : '0.5px solid #2a2a2a',
              borderRadius: '12px', color: '#fff', fontSize: '16px',
              fontFamily: 'monospace', outline: 'none', marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />
          {error && <div style={{ fontSize: '12px', color: '#E31937', marginBottom: '12px' }}>Invalid password</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#E31937',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '14px', fontFamily: 'monospace', cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
