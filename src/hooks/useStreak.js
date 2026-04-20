import { useState, useEffect } from 'react'
import { supabase, today } from '../lib/supabase'

/** Returns the current streak (consecutive completed days) for a single item */
export function useStreak(itemId) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!itemId) return
    let cancelled = false

    async function compute() {
      const { data } = await supabase
        .from('completions')
        .select('log_date, completed')
        .eq('item_id', itemId)
        .eq('completed', true)
        .order('log_date', { ascending: false })
        .limit(366) // max one year

      if (cancelled || !data) return

      const todayStr = today()
      let count = 0
      let cursor = new Date(todayStr)

      for (const row of data) {
        const rowDate = row.log_date
        const cursorStr = cursor.toLocaleDateString('en-CA')
        if (rowDate === cursorStr) {
          count++
          cursor.setDate(cursor.getDate() - 1)
        } else if (rowDate < cursorStr) {
          // Gap — streak broken
          break
        }
        // rowDate > cursorStr means future date, skip
      }

      if (!cancelled) setStreak(count)
    }

    compute()
    return () => { cancelled = true }
  }, [itemId])

  return streak
}
