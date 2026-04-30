import React, { useRef } from 'react'
import { useDesignStore } from '../../lib/store'
import { useToast } from '../shared/Toast'
import './DesignControls.css'

const CATS   = ['shirt','trousers','dress','shoes','bag','blazer']
const COLORS = ['#2C3E50','#E74C3C','#27AE60','#F39C12','#8E44AD','#F2EDE4','#C8A96E','#1ABC9C','#E67E22','#2980B9','#1A1A24','#8B6914']
const SLIDERS = [
  { key:'height', label:'Height (cm)', min:140, max:210, step:1  },
  { key:'chest',  label:'Chest (cm)',  min:70,  max:140, step:1  },
  { key:'waist',  label:'Waist (cm)',  min:55,  max:130, step:1  },
  { key:'hips',   label:'Hips (cm)',   min:60,  max:150, step:1  },
  { key:'shoe',   label:'Shoe (EU)',   min:35,  max:48,  step:0.5 },
]

export default function DesignControls() {
  const { category, color, measurements, texture,
    setCategory, setColor, setMeasurement, setTexture } = useDesignStore()
  const toast   = useToast()
  const fileRef = useRef()

  const handleTexture = e => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast('Image must be under 5MB', 'error'); return }
    const reader = new FileReader()
    reader.onload = ev => { setTexture(ev.target.result); toast('Texture applied!', 'success') }
    reader.readAsDataURL(f)
  }

  return (
    <div className="dc-panel">
      {/* Category */}
      <div className="dc-card">
        <div className="dc-label"><span className="dc-icon">◈</span>Item Category</div>
        <div className="cat-grid">
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`cat-btn${category === c ? ' active' : ''}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div className="dc-card">
        <div className="dc-label"><span className="dc-icon">⊞</span>Measurements</div>
        {SLIDERS.map(s => (
          <div key={s.key} className="slider-row">
            <div className="slider-top">
              <span className="slider-label">{s.label}</span>
              <span className="slider-val">{measurements[s.key]}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step}
              value={measurements[s.key]}
              onChange={e => setMeasurement(s.key, parseFloat(e.target.value))}
              className="slider" />
          </div>
        ))}
      </div>

      {/* Color */}
      <div className="dc-card">
        <div className="dc-label"><span className="dc-icon">◉</span>Fabric Color</div>
        <div className="swatch-grid">
          {COLORS.map(c => (
            <button key={c} className={`swatch${color === c ? ' active' : ''}`}
              style={{ background: c }} onClick={() => setColor(c)} title={c} />
          ))}
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <label className="form-label">Custom Hex</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ height: 34, padding: 2, cursor: 'pointer' }} />
        </div>
      </div>

      {/* Texture Upload */}
      <div className="dc-card">
        <div className="dc-label"><span className="dc-icon">⬆</span>Fabric Texture</div>
        {texture ? (
          <div className="texture-preview">
            <img src={texture} alt="Fabric texture" />
            <button className="texture-remove btn-danger" onClick={() => { setTexture(null); toast('Texture removed') }}>
              Remove
            </button>
          </div>
        ) : (
          <div className="dropzone" onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { fileRef.current.files = e.dataTransfer.files; handleTexture({ target: fileRef.current }) } }}
          >
            <div className="dropzone-icon">⬆</div>
            <div className="dropzone-label">Drop or click to upload</div>
            <div className="dropzone-sub">PNG · JPG · WebP · max 5MB</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleTexture} style={{ display:'none' }} />
        <p className="texture-tip">Use seamless/tileable patterns for best 3D results.</p>
      </div>
    </div>
  )
}
