import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const THRESHOLDS = [7, 21, 30, 66, 100, 365]

/**
 * Returns habits that hit a streak milestone today (streak === threshold).
 * Used by Today screen to surface a celebrations strip.
 * Single batched query for all habits.
 */
export function useHabitCelebrations() {
  const [celebrations, setCelebrations] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: habits } = await supabase
        .from('items')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('type', 'habit')
        .eq('active', true)

      if (!habits?.length) return

      const todayStr = new Date().toLocaleDateString('en-CA')
      const yearAgo  = new Date()
      yearAgo.setDate(yearAgo.getDate() - 364)
      const yearAgoStr = yearAgo.toLocaleDateString('en-CA')

      // Single query: all completions for all habits in the past year
      const { data: comps } = await supabase
        .from('completions')
        .select('item_id, log_date, completed')
        .in('item_id', habits.map(h => h.id))
        .gte('log_date', yearAgoStr)
        .lte('log_date', todayStr)
        .eq('completed', true)

      // Group dates by habit
      const byHabit = {}
      ;(comps || []).forEach(c => {
        if (!byHabit[c.item_id]) byHabit[c.item_id] = new Set()
        byHabit[c.item_id].add(c.log_date)
      })

      const hits = []
      for (const habit of habits) {
        const dates = byHabit[habit.id] ?? new Set()
        if (!dates.has(todayStr)) continue  // only celebrate if completed today

        // Compute current streak backwards from today
        let streak = 0
        for (let i = 0; i < 365; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const ds = d.toLocaleDateString('en-CA')
          if (dates.has(ds)) streak++
          else break
        }

        const milestone = THRESHOLDS.find(t => t === streak)
        if (milestone) {
          hits.push({ habitId: habit.id, title: habit.title, streak, milestone })
        }
      }

      setCelebrations(hits)
    }
    load()
  }, [])

  return celebrations
}
