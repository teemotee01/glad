import React, { useState } from 'react'
import { useRestaurantStore, useDashboardStore } from '../../lib/store'
import { saveReservation } from '../../lib/supabase'
import { useAI, SOMMELIER_SYSTEM } from '../../hooks/useAI'
import { useToast } from '../shared/Toast'
import './ReservationForm.css'

function renderWine(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />
    if (/^[A-Z][A-Z\s]{2,}$/.test(line.trim()))
      return <div key={i} className="wine-head">{line}</div>
    if (line.startsWith('Why'))
      return <div key={i} className="wine-why">{line}</div>
    return <div key={i} className="wine-line">{line}</div>
  })
}

export default function ReservationForm() {
  const { selectedTable, addReservation } = useRestaurantStore()
  const { addActivity, incAI }            = useDashboardStore()
  const { generate, loading: aiLoading }  = useAI()
  const toast = useToast()

  const [form, setForm] = useState({
    name: '', email: '', date: '', time: '19:00', guests: '2', requests: '',
  })
  const [saving,     setSaving]     = useState(false)
  const [winePrompt, setWinePrompt] = useState('')
  const [wineResult, setWineResult] = useState('')

  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast('Please enter your name', 'error'); return }
    if (!form.date)         { toast('Please select a date',  'error'); return }
    setSaving(true)
    try {
      const res = { ...form, table: selectedTable || 'Any' }
      await saveReservation(res)
      addReservation(res)
      addActivity({ text: `Reservation: ${form.name}, ${form.date}`, color: 'jade' })
      toast(`Confirmed for ${form.name} on ${form.date}!`, 'success')
      setForm({ name:'', email:'', date:'', time:'19:00', guests:'2', requests:'' })
    } catch (e) {
      toast('Could not save reservation — check connection', 'error')
    }
    setSaving(false)
  }

  const handleWine = async () => {
    if (!winePrompt.trim()) { toast('Describe your meal or occasion', 'error'); return }
    const result = await generate({ systemPrompt: SOMMELIER_SYSTEM, userPrompt: winePrompt, maxTokens: 500 })
    if (result) {
      setWineResult(result)
      incAI()
      toast('Wine pairing ready!', 'success')
    } else {
      toast('AI unavailable — check connection', 'error')
    }
  }

  return (
    <div className="res-sidebar">
      {/* Reservation card */}
      <div className="res-card">
        <div className="res-title">Reserve a Table</div>

        {selectedTable && (
          <div className="table-notice">
            Table {selectedTable} selected from 3D view
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" value={form.name} onChange={sf('name')} placeholder="Your name" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" value={form.email} onChange={sf('email')} placeholder="you@email.com" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" value={form.date} onChange={sf('date')} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input type="time" value={form.time} onChange={sf('time')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Guests</label>
          <select value={form.guests} onChange={sf('guests')}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Special Requests</label>
          <input type="text" value={form.requests} onChange={sf('requests')}
            placeholder="Dietary, occasion, accessibility…" />
        </div>

        <button className="btn-primary res-submit" onClick={handleSubmit} disabled={saving}>
          {saving ? <><div className="spinner" />Confirming…</> : 'Confirm Reservation'}
        </button>
      </div>

      {/* AI Sommelier card */}
      <div className="res-card">
        <div className="res-title">✦ AI Sommelier</div>
        <textarea
          className="wine-textarea"
          rows={3}
          value={winePrompt}
          onChange={e => setWinePrompt(e.target.value)}
          placeholder="Describe your meal or occasion… e.g. 'Wagyu tenderloin for a romantic anniversary dinner'"
        />
        <button className="btn-primary wine-btn" onClick={handleWine} disabled={aiLoading}>
          {aiLoading ? <><div className="spinner" />Pairing…</> : '✦ Get Wine Pairing'}
        </button>
        {wineResult && (
          <div className="wine-result">
            {renderWine(wineResult)}
          </div>
        )}
      </div>
    </div>
  )
}
