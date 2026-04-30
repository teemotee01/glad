import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase }       from './lib/supabase'
import { useAuthStore }   from './lib/store'
import { ToastProvider }  from './components/shared/Toast'
import Nav           from './components/shared/Nav'
import FashionStudio from './pages/FashionStudio'
import Restaurant    from './pages/Restaurant'
import Dashboard     from './pages/Dashboard'
import Auth          from './pages/Auth'
import './styles/global.css'

function Guard({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="page-loading">NEXUS · LOADING…</div>
  if (!user)   return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const { setUser, clearUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      session?.user ? setUser(session.user) : clearUser()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      session?.user ? setUser(session.user) : clearUser()
    })
    return () => subscription.unsubscribe()
  }, [setUser, clearUser])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/auth"        element={<Auth />} />
          <Route path="/"            element={<Guard><FashionStudio /></Guard>} />
          <Route path="/restaurant"  element={<Guard><Restaurant /></Guard>} />
          <Route path="/dashboard"   element={<Guard><Dashboard /></Guard>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
