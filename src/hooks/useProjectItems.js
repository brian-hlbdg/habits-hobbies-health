import { useState, useEffect, useCallback } from 'react'
import { supabase, today } from '../lib/supabase'

/**
 * Fetches all tasks belonging to a project, merged with today's completion state.
 */
export function useProjectItems(projectId) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!projectId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rows } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', projectId)
      .eq('active', true)
      .order('created_at')

    const date = today()
    const ids  = (rows || []).map(i => i.id)
    let compMap = {}

    if (ids.length) {
      const { data: comps } = await supabase
        .from('completions').select('*')
        .in('item_id', ids).eq('log_date', date)
      ;(comps || []).forEach(c => { compMap[c.item_id] = c })
    }

    setItems((rows || []).map(item => ({
      ...item,
      completed: compMap[item.id]?.completed ?? false,
    })))
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function addTask(title) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('items').insert({
      user_id: user.id,
      title: title.trim(),
      category: 'todo',
      context: 'home',
      view: 'daily',
      frequency: 'daily',
      is_recurring: false,
      project_id: projectId,
    }).select().single()
    if (!error && data) setItems(prev => [...prev, { ...data, completed: false }])
  }

  async function toggleTask(itemId) {
    const { data: { user } } = await supabase.auth.getUser()
    const item = items.find(i => i.id === itemId)
    const newCompleted = !item.completed
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, completed: newCompleted } : i))
    await supabase.from('completions').upsert({
      item_id: itemId,
      user_id: user.id,
      log_date: today(),
      completed: newCompleted,
    }, { onConflict: 'item_id,log_date' })
  }

  async function removeTask(itemId) {
    await supabase.from('items').update({ active: false }).eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  return { items, loading, addTask, toggleTask, removeTask }
}
