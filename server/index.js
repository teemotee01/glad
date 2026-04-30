require('dotenv').config({ path: '../.env' })
const express    = require('express')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')

const app  = express()
const PORT = process.env.PORT || 4000

/* ── Middleware ─────────────────────────────────────── */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}))
app.use(express.json({ limit: '1mb' }))

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests. Please wait a moment.' },
})

/* ── AI Proxy ───────────────────────────────────────── */
app.post('/api/ai/generate', aiLimiter, async (req, res) => {
  const { systemPrompt, userPrompt, maxTokens = 800 } = req.body

  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: 'systemPrompt and userPrompt are required.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server.' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: Math.min(maxTokens, 1500),
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(response.status).json({ error: data.error?.message || 'AI request failed.' })
    }

    const text = data.content?.find(c => c.type === 'text')?.text
    if (!text) return res.status(500).json({ error: 'Empty AI response.' })

    res.json({ text })
  } catch (err) {
    console.error('AI proxy error:', err)
    res.status(500).json({ error: 'Server error. Check logs.' })
  }
})

/* ── Health ─────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  })
})

app.listen(PORT, () => {
  console.log(`\n  NEXUS API  →  http://localhost:${PORT}`)
  console.log(`  Anthropic  →  ${process.env.ANTHROPIC_API_KEY ? '✓ key set' : '✗ missing key'}\n`)
})
