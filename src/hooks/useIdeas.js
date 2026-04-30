import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useIdeas() {
  const [ideas, setIdeas]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setIdeas(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addIdea(title, note = '') {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('ideas')
      .insert({ user_id: user.id, title: title.trim(), note: note.trim() || null })
      .select().single()
    if (!error && data) setIdeas(prev => [data, ...prev])
  }

  async function assignContext(ideaId, context) {
    await supabase.from('ideas').update({ context }).eq('id', ideaId)
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, context } : i))
  }

  // Promote idea → task (item). Returns the new item.
  async function promoteToTask(idea, { view = 'daily', category = 'todo' } = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: item, error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        title: idea.title,
        category,
        context: idea.context || 'home',
        view,
        frequency: view === 'daily' ? 'daily' : view,
        is_recurring: false,
      })
      .select().single()
    if (!error && item) {
      await supabase.from('ideas').delete().eq('id', idea.id)
      setIdeas(prev => prev.filter(i => i.id !== idea.id))
    }
    return item
  }

  // Promote idea → project task
  async function promoteToProjectTask(idea, projectId) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        title: idea.title,
        category: 'todo',
        context: 'home',
        view: 'daily',
        frequency: 'daily',
        is_recurring: false,
        project_id: projectId,
      })
    if (!error) {
      await supabase.from('ideas').delete().eq('id', idea.id)
      setIdeas(prev => prev.filter(i => i.id !== idea.id))
    }
  }

  async function deleteIdea(ideaId) {
    await supabase.from('ideas').delete().eq('id', ideaId)
    setIdeas(prev => prev.filter(i => i.id !== ideaId))
  }

  return { ideas, loading, addIdea, assignContext, promoteToTask, promoteToProjectTask, deleteIdea, reload: load }
}
