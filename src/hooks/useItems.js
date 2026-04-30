import { useState, useEffect, useCallback } from 'react'
import { supabase, today } from '../lib/supabase'

/**
 * Fetch all active items for a given view, plus today's completions.
 * Returns items merged with their completion state for `date`.
 */
// mode: 'tasks' = is_recurring false, 'habits' = is_recurring true, null = all
export function useItems(view, date = today(), mode = 'tasks') {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch items for this view
    let query = supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('view', view)
      .eq('active', true)
      .order('order_index')

    if (mode === 'tasks')  query = query.eq('is_recurring', false)
    if (mode === 'habits') query = query.eq('is_recurring', true)

    const { data: itemRows, error: itemErr } = await query

    if (itemErr) { setError(itemErr.message); setLoading(false); return }

    // Fetch completions for this date
    const ids = (itemRows || []).map(i => i.id)
    let compMap = {}
    if (ids.length > 0) {
      const { data: comps } = await supabase
        .from('completions')
        .select('*')
        .in('item_id', ids)
        .eq('log_date', date)
      ;(comps || []).forEach(c => { compMap[c.item_id] = c })
    }

    const merged = (itemRows || []).map(item => ({
      ...item,
      completion: compMap[item.id] || null,
      completed: compMap[item.id]?.completed ?? false,
      note: compMap[item.id]?.note ?? '',
      carried_forward: compMap[item.id]?.carried_forward ?? false,
    }))

    setItems(merged)
    setLoading(false)
  }, [view, date])

  useEffect(() => { load() }, [load])

  /** Toggle completed state for an item on `date` */
  async function toggle(itemId) {
    const { data: { user } } = await supabase.auth.getUser()
    const item = items.find(i => i.id === itemId)
    const newCompleted = !item.completed

    // Optimistic update
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, completed: newCompleted } : i
    ))

    await supabase.from('completions').upsert({
      item_id: itemId,
      user_id: user.id,
      log_date: date,
      completed: newCompleted,
      note: item.note || null,
      carried_forward: item.carried_forward,
    }, { onConflict: 'item_id,log_date' })
  }

  /** Save a note for an item on `date` */
  async function saveNote(itemId, note) {
    const { data: { user } } = await supabase.auth.getUser()
    const item = items.find(i => i.id === itemId)

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, note } : i))

    await supabase.from('completions').upsert({
      item_id: itemId,
      user_id: user.id,
      log_date: date,
      completed: item.completed,
      note: note || null,
      carried_forward: item.carried_forward,
    }, { onConflict: 'item_id,log_date' })
  }

  /** Add a new item */
  async function addItem({ title, category, context, frequency, is_recurring, due_date }) {
    const { data: { user } } = await supabase.auth.getUser()
    const maxOrder = items.reduce((m, i) => Math.max(m, i.order_index), -1)
    const { data, error } = await supabase.from('items').insert({
      user_id: user.id,
      title,
      category,
      context: context || 'home',
      view,
      frequency: frequency || (view === 'daily' ? 'daily' : view),
      is_recurring: is_recurring ?? true,
      due_date: due_date || null,
      order_index: maxOrder + 1,
    }).select().single()
    if (!error && data) {
      setItems(prev => [...prev, { ...data, completed: false, note: '', carried_forward: false, completion: null }])
    }
  }

  /** Soft-delete an item */
  async function removeItem(itemId) {
    await supabase.from('items').update({ active: false }).eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  /** Update due_date on a task */
  async function updateDueDate(itemId, due_date) {
    await supabase.from('items').update({ due_date: due_date || null }).eq('id', itemId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, due_date: due_date || null } : i))
  }

  return { items, loading, error, toggle, saveNote, addItem, removeItem, updateDueDate, reload: load }
}
