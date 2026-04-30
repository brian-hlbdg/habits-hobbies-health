import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addProject(title) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, title: title.trim() })
      .select().single()
    if (!error && data) setProjects(prev => [data, ...prev])
    return data
  }

  async function completeProject(projectId) {
    await supabase.from('projects').update({ status: 'done' }).eq('id', projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  return { projects, loading, addProject, completeProject, reload: load }
}
