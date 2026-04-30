import React, { useState } from 'react'
import { useAI, FASHION_SYSTEM, PATTERN_SYSTEM } from '../../hooks/useAI'
import { useDesignStore, useDashboardStore } from '../../lib/store'
import { useToast } from '../shared/Toast'
import './AIDesigner.css'

function renderAIResult(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />
    // Section headers (all caps)
    if (/^[A-Z][A-Z\s]{2,}$/.test(line.trim())) return (
      <div key={i} className="ai-section-head">{line}</div>
    )
    // Bullet points
    if (line.startsWith('—') || line.startsWith('-')) return (
      <div key={i} className="ai-bullet">{line}</div>
    )
    // Numbered steps
    if (/^\d+\./.test(line.trim())) return (
      <div key={i} className="ai-step">{line}</div>
    )
    // Hex color lines
    if (line.includes('#') && line.match(/#[0-9a-fA-F]{3,6}/)) {
      const hex = line.match(/#[0-9a-fA-F]{3,6}/)[0]
      return (
        <div key={i} className="ai-color-line">
          <div className="ai-color-dot" style={{ background: hex }} />
          <span>{line}</span>
        </div>
      )
    }
    return <div key={i} className="ai-line">{line}</div>
  })
}

export default function AIDesigner() {
  const { generate, loading } = useAI()
  const { category, measurements, setAiResult, aiResult } = useDesignStore()
  const { incAI, addActivity } = useDashboardStore()
  const toast = useToast()

  const [tab,    setTab]    = useState('design')
  const [prompt, setPrompt] = useState('')
  const [pattern, setPattern] = useState(null)

  const handleDesign = async () => {
    if (!prompt.trim()) { toast('Describe your design first', 'error'); return }
    const result = await generate({
      systemPrompt: FASHION_SYSTEM,
      userPrompt: `Design brief: ${prompt}\nCategory: ${category}\nMeasurements: H${measurements.height}cm C${measurements.chest}cm W${measurements.waist}cm`,
    })
    if (result) {
      setAiResult(result)
      incAI()
      addActivity({ text: `AI brief: "${prompt.slice(0,42)}…"`, color: 'jade' })
      toast('Design brief generated!', 'success')
    } else {
      toast('AI generation failed — check connection', 'error')
    }
  }

  const handlePattern = async () => {
    const { height, chest, waist, hips, shoe } = measurements
    const result = await generate({
      systemPrompt: PATTERN_SYSTEM,
      userPrompt: `Garment: ${category}\nH:${height}cm C:${chest}cm W:${waist}cm Hips:${hips}cm Shoe EU:${shoe}`,
    })
    if (result) {
      setPattern(result)
      incAI()
      addActivity({ text: `Pattern generated for ${category}`, color: 'gold' })
      toast('Pattern guide ready!', 'success')
    } else {
      toast('Pattern generation failed', 'error')
    }
  }

  return (
    <div className="ai-designer">
      <div className="ai-tabs">
        {[{ id:'design', label:'✦ Design Brief' }, { id:'pattern', label:'⊞ Pattern Guide' }].map(t => (
          <button key={t.id} className={`ai-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ai-body">
        {tab === 'design' ? (
          <>
            <textarea className="ai-textarea" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder={`Describe your ${category}… e.g. "Oversized linen blazer with deconstructed lapels, chalk stripe, relaxed silhouette"`} />
            <button className="ai-btn btn-primary" onClick={handleDesign} disabled={loading}>
              {loading ? <><div className="spinner"/>Generating…</> : '✦ Generate Design Brief'}
            </button>
            {aiResult && <div className="ai-result">{renderAIResult(aiResult)}</div>}
          </>
        ) : (
          <>
            <p className="ai-desc">
              Auto-generate a full cutting guide and assembly steps from your current measurements:
              H{measurements.height} · C{measurements.chest} · W{measurements.waist}cm.
            </p>
            <button className="ai-btn btn-primary" onClick={handlePattern} disabled={loading}>
              {loading ? <><div className="spinner"/>Generating…</> : '⊞ Generate Pattern Guide'}
            </button>
            {pattern && <div className="ai-result">{renderAIResult(pattern)}</div>}
          </>
        )}
      </div>
    </div>
  )
}
