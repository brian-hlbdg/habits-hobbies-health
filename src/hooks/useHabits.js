import { useState, useEffect, useCallback } from 'react'
import { supabase, today } from '../lib/supabase'

/**
 * Fetches all active recurring habits, merged with today's completion state.
 */
export function useHabits() {
  const [habits, setHabits]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rows } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'habit')
      .eq('active', true)
      .order('category')
      .order('order_index')

    const date = today()
    const ids  = (rows || []).map(i => i.id)
    let compMap = {}

    if (ids.length) {
      const { data: comps } = await supabase
        .from('completions').select('item_id, completed, note')
        .in('item_id', ids).eq('log_date', date)
      ;(comps || []).forEach(c => { compMap[c.item_id] = c })
    }

    setHabits((rows || []).map(h => ({
      ...h,
      completed:  compMap[h.id]?.completed ?? false,
      note:       compMap[h.id]?.note ?? '',
    })))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle(habitId) {
    const { data: { user } } = await supabase.auth.getUser()
    const habit = habits.find(h => h.id === habitId)
    const newCompleted = !habit.completed

    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, completed: newCompleted } : h
    ))

    await supabase.from('completions').upsert({
      item_id:  habitId,
      user_id:  user.id,
      log_date: today(),
      completed: newCompleted,
      note: habit.note || null,
    }, { onConflict: 'item_id,log_date' })
  }

  async function addHabit({ title, category, context, frequency }) {
    const { data: { user } } = await supabase.auth.getUser()
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.order_index), -1)
    const freq = frequency || 'daily'
    const { data, error } = await supabase.from('items').insert({
      user_id: user.id,
      title,
      category: category || 'daily',
      context:  context  || 'home',
      type: 'habit',
      view: freq,          // view matches frequency for habits
      frequency: freq,
      is_recurring: true,
      order_index: maxOrder + 1,
    }).select().single()
    if (!error && data) {
      setHabits(prev => [...prev, { ...data, completed: false, note: '' }])
    }
  }

  async function removeHabit(habitId) {
    await supabase.from('items').update({ active: false }).eq('id', habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  return { habits, loading, toggle, addHabit, removeHabit, reload: load }
}
