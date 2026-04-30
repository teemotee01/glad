import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useRestaurantStore } from '../../lib/store'
import { signOut } from '../../lib/supabase'
import './Nav.css'

export default function Nav() {
  const { user }     = useAuthStore()
  const cartCount    = useRestaurantStore(s => s.cartCount())
  const navigate     = useNavigate()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  const links = [
    { to: '/',           label: 'Fashion Studio', end: true },
    { to: '/restaurant', label: 'Restaurant' },
    { to: '/dashboard',  label: 'Dashboard' },
  ]

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">NEXUS</NavLink>

      <div className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {l.label}
            {l.to === '/restaurant' && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <div className="user-avatar">{user.email?.[0]?.toUpperCase()}</div>
          <span className="user-email">{user.email}</span>
        </div>
        <button className="btn-ghost nav-out" onClick={handleSignOut}>Sign out</button>
      </div>

      <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>
    </nav>
  )
}
