import React, { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'default', ms = 3600) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms)
  }, [])

  const icons  = { success: '✓', error: '✕', default: '◈' }
  const accent = { success: '#00C896', error: '#E8304A', default: '#C8A96E' }

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'rgba(12,12,18,0.97)',
            border: `1px solid rgba(200,169,110,0.22)`,
            borderLeft: `3px solid ${accent[t.type]}`,
            borderRadius: 10, padding: '11px 16px',
            fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 10,
            animation: 'fadeUp .3s ease', maxWidth: 310,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(16px)',
          }}>
            <span style={{ color: accent[t.type], fontSize: '0.72rem', flexShrink: 0 }}>{icons[t.type]}</span>
            <span style={{ color: '#F2EDE4', lineHeight: 1.4 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
