import React from 'react'
import RestaurantScene  from '../components/restaurant/RestaurantScene'
import Menu             from '../components/restaurant/Menu'
import ReservationForm  from '../components/restaurant/ReservationForm'
import { useRestaurantStore } from '../lib/store'
import './Restaurant.css'

export default function Restaurant() {
  const { selectedTable, setSelectedTable } = useRestaurantStore()

  return (
    <div className="rest-page">
      {/* Hero */}
      <div className="rest-hero">
        <div className="rest-hero-bg" />
        <div className="rest-hero-content fade-up">
          <div className="rest-hero-tag">
            <span className="tag-pulse" />
            3D Fine Dining Experience
          </div>
          <h1 className="rest-hero-title">
            Dine in a world<br />built for <em>you</em>
          </h1>
          <p className="rest-hero-desc">
            Explore the restaurant in 3D, pick your table, order from tonight's menu,
            and let our AI sommelier find the perfect wine pairing.
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            <button className="btn-primary"
              onClick={() => document.getElementById('scene')?.scrollIntoView({ behavior:'smooth' })}>
              View Dining Room
            </button>
            <button className="btn-ghost"
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior:'smooth' })}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="section" id="scene" style={{ background:'var(--obsidian2)' }}>
        <div className="section-header">
          <div className="section-tag">/ Dining Room</div>
          <h2 className="section-title">Choose your <em>table</em></h2>
          <p className="scene-desc">
            Orbit the dining room in 3D. Click any green table to select it for your reservation.
          </p>
        </div>
        <RestaurantScene selectedTable={selectedTable} onSelect={setSelectedTable} />
      </div>

      {/* Menu + Reservation */}
      <div className="section" id="menu-section">
        <div className="section-header">
          <div className="section-tag">/ Menu & Reservations</div>
          <h2 className="section-title">Order &amp; <em>Reserve</em></h2>
        </div>
        <div className="rest-grid">
          <Menu />
          <ReservationForm />
        </div>
      </div>
    </div>
  )
}
