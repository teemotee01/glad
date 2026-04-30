import React, { useEffect, useState } from 'react'
import { useDesignStore, useRestaurantStore, useDashboardStore } from '../lib/store'
import { fetchDesigns, fetchOrders, fetchReservations } from '../lib/supabase'
import './Dashboard.css'

const timeAgo = (d) => {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const DOT_COLORS = { jade:'var(--jade)', gold:'var(--gold)', crimson:'var(--crimson)', grey:'rgba(242,237,228,0.2)' }

function StatCard({ label, value, delta, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: accent }}>{value}</div>
      {delta && <div className="stat-delta">{delta}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { saved }         = useDesignStore()
  const { reservations, cart, cartTotal } = useRestaurantStore()
  const { aiCount, activity } = useDashboardStore()

  const [dbDesigns, setDbDesigns]   = useState([])
  const [dbOrders,  setDbOrders]    = useState([])
  const [dbRes,     setDbRes]       = useState([])

  useEffect(() => {
    fetchDesigns().then(({ data }) => data && setDbDesigns(data))
    fetchOrders().then(({ data }) => data && setDbOrders(data))
    fetchReservations().then(({ data }) => data && setDbRes(data))
  }, [])

  const allDesigns = [...saved, ...dbDesigns]
  const allRes     = [...reservations, ...dbRes]
  const cartItems  = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="dash-page">
      <div className="section">
        {/* Header */}
        <div className="section-header fade-up">
          <div className="section-tag">/ Platform Dashboard</div>
          <h2 className="section-title">Your <em>Nexus</em> overview</h2>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Designs Saved"   value={allDesigns.length} delta="↑ Fashion Studio" accent="var(--gold)" />
          <StatCard label="Reservations"    value={allRes.length}     delta="↑ Confirmed"      accent="var(--jade)" />
          <StatCard label="Cart Items"      value={cartItems}         delta={cartItems > 0 ? `↑ ₦${cartTotal().toLocaleString()} total` : null} accent="var(--ivory)" />
          <StatCard label="AI Generations"  value={aiCount}           delta="↑ Design + Wine"  accent="var(--crimson)" />
        </div>

        {/* Main Grid */}
        <div className="dash-grid">
          {/* Designs table */}
          <div className="dash-card">
            <div className="dash-card-title">Saved Designs</div>
            {allDesigns.length === 0 ? (
              <div className="dash-empty">No designs yet. Head to Fashion Studio.</div>
            ) : (
              <div>
                <div className="dash-table-head">
                  <span>Color</span><span>Category</span><span>Measurements</span><span>Date</span>
                </div>
                {allDesigns.slice(0, 10).map((d, i) => (
                  <div key={d.id || i} className="dash-table-row">
                    <div className="design-swatch" style={{ background: d.color || '#C8A96E' }} />
                    <span className="design-cat">{d.category || d.name}</span>
                    <span className="design-meta">
                      {d.measurements ? `H:${d.measurements.height} · C:${d.measurements.chest}` : '—'}
                    </span>
                    <span className="design-date">
                      {d.savedAt || d.created_at ? new Date(d.savedAt || d.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="dash-right">
            {/* Activity feed */}
            <div className="dash-card">
              <div className="dash-card-title">Live Activity</div>
              {activity.length === 0 ? (
                <div className="dash-empty">No activity yet — start designing!</div>
              ) : (
                activity.slice(0, 10).map(a => (
                  <div key={a.id} className="activity-item">
                    <div className="activity-dot" style={{ background: DOT_COLORS[a.color] || DOT_COLORS.grey }} />
                    <div>
                      <div className="activity-text">{a.text}</div>
                      <div className="activity-time">{timeAgo(a.time)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reservations */}
            <div className="dash-card" style={{ marginTop:'1rem' }}>
              <div className="dash-card-title">Reservations</div>
              {allRes.length === 0 ? (
                <div className="dash-empty">No reservations yet.</div>
              ) : (
                allRes.slice(0, 5).map((r, i) => (
                  <div key={r.id || i} className="res-row">
                    <div>
                      <div className="res-name">{r.name}</div>
                      <div className="res-meta">{r.date} · {r.time} · {r.guests}p · T{r.table || r.table_number || 'Any'}</div>
                    </div>
                    <span className="badge badge-green">{r.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
