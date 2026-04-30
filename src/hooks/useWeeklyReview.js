import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Returns everything completed during the current week (Sun–today):
 * - habitStats: per-habit day counts for the week
 * - completedTasks: unique tasks (any view) completed at least once this week
 */
export function useWeeklyReview() {
  const [habitStats, setHabitStats]         = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [loading, setLoading]               = useState(true)

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

      const startStr    = start.toLocaleDateString('en-CA')
      const todayStr    = now.toLocaleDateString('en-CA')
      const daysElapsed = day + 1  // days in week so far (Sun=1 … Sat=7)

      // Single query: all completions this week joined with their items
      const { data: comps } = await supabase
        .from('completions')
        .select('item_id, log_date, items(id, title, type, view, category, context, active)')
        .eq('user_id', user.id)
        .gte('log_date', startStr)
        .lte('log_date', todayStr)
        .eq('completed', true)

      const rows = (comps || []).filter(c => c.items)

      // ── Habits ──
      const habitRows = rows.filter(c => c.items.type === 'habit' && c.items.active)
      const habitCompMap = {}
      habitRows.forEach(c => {
        if (!habitCompMap[c.item_id]) habitCompMap[c.item_id] = { item: c.items, dates: new Set() }
        habitCompMap[c.item_id].dates.add(c.log_date)
      })

      // Also include active habits with zero completions this week
      const { data: allHabits } = await supabase
        .from('items')
        .select('id, title, context')
        .eq('user_id', user.id)
        .eq('type', 'habit')
        .eq('active', true)

      const habitStatsArr = (allHabits || []).map(h => {
        const entry = habitCompMap[h.id]
        const done  = entry?.dates.size ?? 0
        return {
          id:            h.id,
          title:         h.title,
          context:       h.context,
          daysCompleted: done,
          daysTotal:     daysElapsed,
          pct:           Math.round((done / daysElapsed) * 100),
        }
      })

      // ── Tasks (any view, completed this week, deduplicated by item_id) ──
      const taskRows = rows.filter(c => c.items.type === 'task' && c.items.active)
      const taskMap  = {}
      taskRows.forEach(c => {
        if (!taskMap[c.item_id]) {
          taskMap[c.item_id] = { ...c.items, completedOn: c.log_date }
        }
      })
      const taskArr = Object.values(taskMap).sort((a, b) => {
        const order = { daily: 0, weekly: 1, monthly: 2, yearly: 3 }
        return (order[a.view] ?? 4) - (order[b.view] ?? 4)
      })

      setHabitStats(habitStatsArr)
      setCompletedTasks(taskArr)
      setLoading(false)
    }
    load()
  }, [])

  return { habitStats, completedTasks, loading }
}
