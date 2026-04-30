import { createClient } from '@supabase/supabase-js'

const URL  = process.env.REACT_APP_SUPABASE_URL
const ANON = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!URL || !ANON) {
  console.warn('[Supabase] Missing env vars. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env')
}

export const supabase = createClient(URL || '', ANON || '')

/* ── Auth ───────────────────────────────────────── */
export const signUp   = (email, password, meta = {}) =>
  supabase.auth.signUp({ email, password, options: { data: meta } })

export const signIn   = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut  = () => supabase.auth.signOut()
export const getUser  = () => supabase.auth.getUser()

/* ── Designs ────────────────────────────────────── */
export const saveDesign = async (design) => {
  const { data: { user } } = await getUser()
  return supabase.from('designs').insert({ ...design, user_id: user.id })
}

export const fetchDesigns = async () => {
  const { data: { user } } = await getUser()
  return supabase.from('designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
}

export const deleteDesign = (id) => supabase.from('designs').delete().eq('id', id)

/* ── Reservations ───────────────────────────────── */
export const saveReservation = async (res) => {
  const { data: { user } } = await getUser()
  return supabase.from('reservations').insert({ ...res, user_id: user.id })
}

export const fetchReservations = async () => {
  const { data: { user } } = await getUser()
  return supabase.from('reservations').select('*').eq('user_id', user.id).order('date', { ascending: true })
}

/* ── Orders ─────────────────────────────────────── */
export const saveOrder = async (items, total) => {
  const { data: { user } } = await getUser()
  return supabase.from('orders').insert({ user_id: user.id, items, total, status: 'pending' })
}

export const fetchOrders = async () => {
  const { data: { user } } = await getUser()
  return supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
}
