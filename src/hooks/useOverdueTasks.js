import { useState, useEffect, useCallback } from 'react'
import { supabase, today } from '../lib/supabase'

/**
 * Fetches non-recurring tasks from weekly/monthly/yearly views
 * that have a due_date before today and haven't been completed today.
 * These are surfaced in the Today view as overdue items.
 */
export function useOverdueTasks() {
  const [overdue, setOverdue]   = useState([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const todayStr = today()

    const { data: rows } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'task')
      .eq('active', true)
      .eq('is_recurring', false)
      .in('view', ['weekly', 'monthly', 'yearly'])
      .not('due_date', 'is', null)
      .lt('due_date', todayStr)

    if (!rows?.length) { setOverdue([]); setLoading(false); return }

    // Filter out any already completed today
    const ids = rows.map(r => r.id)
    const { data: comps } = await supabase
      .from('completions')
      .select('item_id')
      .in('item_id', ids)
      .eq('log_date', todayStr)
      .eq('completed', true)

    const completedToday = new Set((comps || []).map(c => c.item_id))

    setOverdue(
      rows
        .filter(r => !completedToday.has(r.id))
        .map(r => ({ ...r, completed: false, note: '', carried_forward: false, completion: null }))
    )
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function complete(itemId) {
    const { data: { user } } = await supabase.auth.getUser()
    // Optimistic: remove from overdue list
    setOverdue(prev => prev.filter(i => i.id !== itemId))
    await supabase.from('completions').upsert({
      item_id: itemId,
      user_id: user.id,
      log_date: today(),
      completed: true,
    }, { onConflict: 'item_id,log_date' })
  }

  return { overdue, loading, complete }
}
