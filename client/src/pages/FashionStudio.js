import React from 'react'
import ModelViewer    from '../components/fashion/ModelViewer'
import DesignControls from '../components/fashion/DesignControls'
import AIDesigner     from '../components/fashion/AIDesigner'
import { useDesignStore, useDashboardStore } from '../lib/store'
import { saveDesign }  from '../lib/supabase'
import { exportPDF }   from '../lib/exportPDF'
import { useToast }    from '../components/shared/Toast'
import './FashionStudio.css'

export default function FashionStudio() {
  const design  = useDesignStore()
  const { addActivity } = useDashboardStore()
  const toast   = useToast()

  const handleSave = async () => {
    try {
      const d = design.currentDesign()
      await saveDesign({ ...d, name: `${d.category} design` })
      design.addSaved(d)
      addActivity({ text: `Saved ${d.category} design`, color: 'gold' })
      toast('Design saved!', 'success')
    } catch {
      toast('Save failed — check Supabase config', 'error')
    }
  }

  const handleExport = () => {
    exportPDF({
      category:     design.category,
      measurements: design.measurements,
      color:        design.color,
      aiResult:     design.aiResult,
    })
    addActivity({ text: `PDF exported: ${design.category}`, color: 'jade' })
    toast('PDF pattern downloaded!', 'success')
  }

  return (
    <div className="fs-page">
      {/* ── Hero ──────────────────────────────── */}
      <div className="fs-hero">
        <div className="fs-hero-bg" />
        <div className="fs-hero-grid" />
        <div className="fs-hero-content fade-up">
          <div className="fs-hero-tag">
            <span className="tag-pulse" />
            AI-Powered 3D Design Studio
          </div>
          <h1 className="fs-hero-title">
            Design your<br />
            <em>perfect piece</em><br />
            in 3D.
          </h1>
          <p className="fs-hero-desc">
            Craft clothing, shoes, and bags with real-time Three.js 3D preview,
            AI-generated sewing patterns, and one-click PDF export.
          </p>
          <div className="fs-hero-actions">
            <button className="btn-primary"
              onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior:'smooth' })}>
              Open Studio
            </button>
            <button className="btn-ghost"
              onClick={() => document.getElementById('saved')?.scrollIntoView({ behavior:'smooth' })}>
              My Designs ({design.saved.length})
            </button>
          </div>
        </div>
        <div className="fs-hero-orb">
          <div className="orb-text">THREE.JS<br /><span>WebGL · AI</span></div>
        </div>
      </div>

      {/* ── Studio ────────────────────────────── */}
      <div className="section" id="studio" style={{ background:'var(--obsidian2)' }}>
        <div className="section-header">
          <div className="section-tag">/ Design Studio</div>
          <h2 className="section-title">Build. Customize. <em>Export.</em></h2>
        </div>

        <div className="studio-layout">
          {/* Left: Viewer + AI */}
          <div className="studio-left">
            <div className="viewer-card">
              <div className="viewer-topbar">
                <span className="viewer-caption">
                  Viewing: <strong>{design.category}</strong>
                  {design.texture && <span className="texture-badge">· texture on</span>}
                </span>
                <div className="window-dots">
                  <span style={{ background:'#FF5F57' }} />
                  <span style={{ background:'#FFBC2E' }} />
                  <span style={{ background:'#28C840' }} />
                </div>
              </div>
              <ModelViewer
                category={design.category}
                color={design.color}
                textureUrl={design.texture}
              />
            </div>
            <AIDesigner />
          </div>

          {/* Right: Controls + Export */}
          <div className="studio-right">
            <DesignControls />
            <div className="export-row">
              <button className="btn-ghost export-btn" onClick={handleExport}>⬇ PDF Pattern</button>
              <button className="btn-primary export-btn" onClick={handleSave}>✦ Save Design</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Saved Designs ─────────────────────── */}
      <div className="section" id="saved">
        <div className="section-header">
          <div className="section-tag">/ My Designs</div>
          <h2 className="section-title">Saved <em>creations</em></h2>
        </div>

        {design.saved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No saved designs yet. Create one above and click <strong>Save Design</strong>.</p>
          </div>
        ) : (
          <div className="saved-grid">
            {design.saved.map(d => (
              <div key={d.id} className="saved-card">
                <div className="saved-swatch" style={{ background: d.color }} />
                <div className="saved-info">
                  <div className="saved-cat">{d.category}</div>
                  <div className="saved-meta">
                    H:{d.measurements.height} · C:{d.measurements.chest} · W:{d.measurements.waist}
                  </div>
                  <div className="saved-date">{new Date(d.savedAt).toLocaleDateString()}</div>
                </div>
                <div className="saved-actions">
                  <button className="btn-ghost" style={{ fontSize:'0.72rem', padding:'6px 12px' }}
                    onClick={() => { exportPDF({ ...d }); toast('Pattern exported!', 'success') }}>
                    ⬇ PDF
                  </button>
                  <button className="btn-danger" onClick={() => design.removeSaved(d.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
