import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Return today's date as a YYYY-MM-DD string (local time) */
export function today() {
  return new Date().toLocaleDateString('en-CA')
}

/** Return yesterday's date as YYYY-MM-DD */
export function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}

/** Days between two YYYY-MM-DD strings (b - a) */
export function daysBetween(a, b) {
  const msA = new Date(a).getTime()
  const msB = new Date(b).getTime()
  return Math.round((msB - msA) / 86_400_000)
}
