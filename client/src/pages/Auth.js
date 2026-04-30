import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'
import './Auth.css'

export default function Auth() {
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (!email || !password)      { setError('Please fill in all fields.'); return }
    if (password.length < 6)      { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: e } = await signIn(email, password)
        if (e) throw e
      } else {
        const { error: e } = await signUp(email, password, { full_name: name })
        if (e) throw e
      }
      navigate('/')
    } catch (e) {
      setError(e.message || 'Authentication failed.')
    }
    setLoading(false)
  }

  const onKey = e => e.key === 'Enter' && handleSubmit()

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-grid" />

      <div className="auth-box fade-up">
        <div className="auth-logo">NEXUS</div>
        <div className="auth-tagline">Fashion Studio &amp; Fine Dining Platform</div>

        <div className="auth-tabs">
          <button className={`auth-tab${mode==='login'?' active':''}`}
            onClick={() => { setMode('login'); setError('') }}>Sign In</button>
          <button className={`auth-tab${mode==='signup'?' active':''}`}
            onClick={() => { setMode('signup'); setError('') }}>Create Account</button>
        </div>

        {mode === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)}
              placeholder="Your name" onKeyDown={onKey} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="you@email.com" onKeyDown={onKey} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••" onKeyDown={onKey} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="btn-primary auth-submit" onClick={handleSubmit} disabled={loading}>
          {loading
            ? <><div className="spinner" />{mode==='login'?'Signing in…':'Creating account…'}</>
            : mode==='login' ? 'Sign In' : 'Create Account'
          }
        </button>

        <div className="auth-features">
          <span>◈ 3D Fashion Studio</span>
          <span>⊞ AI Pattern Generator</span>
          <span>✦ AI Sommelier</span>
          <span>⬇ PDF Export</span>
        </div>
      </div>
    </div>
  )
}
