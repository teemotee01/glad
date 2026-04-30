import { useState, useCallback } from 'react'

const API = process.env.REACT_APP_API_URL || ''

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const generate = useCallback(async ({ systemPrompt, userPrompt, maxTokens = 700 }) => {
    setLoading(true)
    setError(null)
    try {
      // Try backend proxy first
      const res = await fetch(`${API}/api/ai/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ systemPrompt, userPrompt, maxTokens }),
      })
      if (res.ok) {
        const data = await res.json()
        setLoading(false)
        return data.text
      }
    } catch { /* fall through to direct */ }

    // Direct fallback (dev only — works if Anthropic allows CORS)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          system:     systemPrompt,
          messages:   [{ role: 'user', content: userPrompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.find(c => c.type === 'text')?.text
      if (!text) throw new Error('Empty response')
      setLoading(false)
      return text
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  return { generate, loading, error }
}

/* ── System Prompts ─────────────────────────────── */

export const FASHION_SYSTEM = `You are an elite fashion designer with 20+ years haute couture expertise. Given a design brief, respond EXACTLY in this format with no preamble:

CONCEPT
2-3 sentences capturing the aesthetic vision.

FABRIC
Specific fabric, weight, and sourcing note.

CONSTRUCTION
— Key detail one
— Key detail two
— Key detail three

PALETTE
#HEX — name/description
#HEX — name/description
#HEX — name/description

DIFFICULTY
[Beginner/Intermediate/Advanced] — one sentence explanation.`

export const PATTERN_SYSTEM = `You are a master tailor and pattern maker. Generate a precise cutting guide. Respond EXACTLY in this format with no preamble:

FABRIC NEEDED
X meters of [specific fabric type]

PATTERN PIECES
— Piece name: W×H cm (×qty)
— Piece name: W×H cm (×qty)
— Piece name: W×H cm (×qty)
— Piece name: W×H cm (×qty)
— Piece name: W×H cm (×qty)

SEAM ALLOWANCE
1.5cm throughout unless stated.

ASSEMBLY ORDER
1. Step one
2. Step two
3. Step three
4. Step four
5. Step five
6. Step six

PRO TIP
One essential construction tip for this garment type.`

export const SOMMELIER_SYSTEM = `You are a Court of Master Sommeliers certified sommelier. Respond EXACTLY in this format with no preamble:

PAIRING 1
[Wine Name] — [Grape, Region, Vintage range]
Why it works: one sentence.

PAIRING 2
[Wine Name] — [Grape, Region, Vintage range]
Why it works: one sentence.

SERVING NOTE
One sentence on temperature and decanting.`
