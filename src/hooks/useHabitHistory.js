import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = 84 // 12 weeks

/**
 * Returns the last 84 days of completion data for a habit as a Map: dateStr → boolean
 * Also returns the current streak and all earned milestones.
 */
export function useHabitHistory(habitId) {
  const [grid, setGrid]                           = useState([])
  const [streak, setStreak]                       = useState(0)
  const [bestStreak, setBestStreak]               = useState(0)
  const [milestones, setMilestones]               = useState([])
  const [newMilestone, setNewMilestone]           = useState(null)  // threshold hit today
  const [daysSinceLastCompletion, setDaysSince]   = useState(null)
  const [loading, setLoading]                     = useState(true)

  useEffect(() => {
    if (!habitId) return
    async function load() {
      const today = new Date()
      const start = new Date(today)
      start.setDate(today.getDate() - (DAYS - 1))
      const startStr = start.toLocaleDateString('en-CA')
      const todayStr = today.toLocaleDateString('en-CA')

      const { data: comps } = await supabase
        .from('completions')
        .select('log_date, completed')
        .eq('item_id', habitId)
        .gte('log_date', startStr)
        .lte('log_date', todayStr)

      const compMap = {}
      ;(comps || []).forEach(c => { compMap[c.log_date] = c.completed })

      // Build grid: each entry = one day
      const cells = []
      // Align start to Sunday of that week so columns line up
      const gridStart = new Date(start)
      gridStart.setDate(start.getDate() - start.getDay())

      for (let i = 0; i < DAYS + start.getDay(); i++) {
        const d = new Date(gridStart)
        d.setDate(gridStart.getDate() + i)
        const dateStr = d.toLocaleDateString('en-CA')
        const inRange = dateStr >= startStr && dateStr <= todayStr
        cells.push({
          date:      dateStr,
          completed: inRange ? (compMap[dateStr] ?? false) : null, // null = out of range
          col:       Math.floor(i / 7),
          row:       i % 7,
        })
      }
      setGrid(cells)

      // Compute current streak (working backwards from today)
      let cur = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const ds = d.toLocaleDateString('en-CA')
        if (compMap[ds]) cur++
        else break
      }
      setStreak(cur)

      // Compute best streak across all history
      let best = 0, run = 0
      const sorted = Object.entries(compMap)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .sort()
      for (let i = 0; i < sorted.length; i++) {
        if (i === 0) { run = 1; continue }
        const prev = new Date(sorted[i - 1])
        const curr = new Date(sorted[i])
        const diff = (curr - prev) / 86400000
        run = diff === 1 ? run + 1 : 1
        best = Math.max(best, run)
      }
      best = Math.max(best, run, cur)
      setBestStreak(best)

      // Milestones earned (based on best streak)
      const THRESHOLDS = [7, 21, 30, 66, 100, 365]
      setMilestones(THRESHOLDS.filter(t => best >= t))

      // New milestone: today's streak exactly equals a threshold (just achieved today)
      setNewMilestone(THRESHOLDS.find(t => cur === t) ?? null)

      // Days since last completion
      const allDates = Object.entries(compMap)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .sort()
      const lastDate = allDates.at(-1)
      if (lastDate) {
        const last = new Date(lastDate)
        const diff = Math.floor((today - last) / 86400000)
        setDaysSince(diff)
      } else {
        setDaysSince(null) // never completed
      }

      setLoading(false)
    }
    load()
  }, [habitId])

  return { grid, streak, bestStreak, milestones, newMilestone, daysSinceLastCompletion, loading }
}
