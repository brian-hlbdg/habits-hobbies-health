import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetches habit completion data for the current week (Sun–today).
 * Returns per-habit stats and an overall summary.
 */
export function useWeeklyReview() {
  const [stats, setStats]   = useState([])   // [{ id, title, daysCompleted, daysTotal }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Week range: Sunday → today
      const now   = new Date()
      const day   = now.getDay()  // 0=Sun
      const start = new Date(now)
      start.setDate(now.getDate() - day)
      start.setHours(0, 0, 0, 0)

      const startStr = start.toLocaleDateString('en-CA')
      const todayStr = now.toLocaleDateString('en-CA')
      const daysElapsed = day + 1  // days in the week so far (Sun=1, Mon=2, …)

      const { data: habits } = await supabase
        .from('items')
        .select('id, title, context')
        .eq('user_id', user.id)
        .eq('type', 'habit')
        .eq('active', true)

      if (!habits?.length) { setStats([]); setLoading(false); return }

      const { data: comps } = await supabase
        .from('completions')
        .select('item_id, log_date, completed')
        .in('item_id', habits.map(h => h.id))
        .gte('log_date', startStr)
        .lte('log_date', todayStr)
        .eq('completed', true)

      const compMap = {}
      ;(comps || []).forEach(c => {
        if (!compMap[c.item_id]) compMap[c.item_id] = new Set()
        compMap[c.item_id].add(c.log_date)
      })

      setStats(habits.map(h => ({
        id:            h.id,
        title:         h.title,
        context:       h.context,
        daysCompleted: compMap[h.id]?.size ?? 0,
        daysTotal:     daysElapsed,
        pct:           Math.round(((compMap[h.id]?.size ?? 0) / daysElapsed) * 100),
      })))
      setLoading(false)
    }
    load()
  }, [])

  return { stats, loading }
}
