import { useEffect } from 'react'
import { supabase, today, yesterday } from '../lib/supabase'

/**
 * On mount, find all daily-recurring items that were NOT completed yesterday
 * and ensure a completion row exists for today with carried_forward = true.
 * This only runs once per session.
 */
export function useCarryForward() {
  useEffect(() => {
    const key = `cf-ran-${today()}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    async function run() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const yest = yesterday()
      const tod  = today()

      // All active daily items for this user
      const { data: dailyItems } = await supabase
        .from('items')
        .select('id')
        .eq('user_id', user.id)
        .eq('frequency', 'daily')
        .eq('is_recurring', true)
        .eq('active', true)

      if (!dailyItems?.length) return

      const ids = dailyItems.map(i => i.id)

      // Yesterday's completions
      const { data: yesterdayComps } = await supabase
        .from('completions')
        .select('item_id, completed')
        .in('item_id', ids)
        .eq('log_date', yest)

      const completedYesterday = new Set(
        (yesterdayComps || []).filter(c => c.completed).map(c => c.item_id)
      )

      // Today's existing completions (avoid overwriting)
      const { data: todayComps } = await supabase
        .from('completions')
        .select('item_id')
        .in('item_id', ids)
        .eq('log_date', tod)

      const alreadyToday = new Set((todayComps || []).map(c => c.item_id))

      // Items not completed yesterday and not yet tracked today
      const toCarry = ids.filter(id => !completedYesterday.has(id) && !alreadyToday.has(id))

      if (!toCarry.length) return

      await supabase.from('completions').insert(
        toCarry.map(item_id => ({
          item_id,
          user_id: user.id,
          log_date: tod,
          completed: false,
          carried_forward: true,
        }))
      )
    }

    run()
  }, [])
}
