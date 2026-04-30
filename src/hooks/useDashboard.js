import { useState, useEffect } from 'react'
import { supabase, today } from '../lib/supabase'

export function useDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const date = today()

      const [
        { data: items },
        { data: ideas },
        { data: projects },
      ] = await Promise.all([
        supabase.from('items').select('id, context, due_date, project_id').eq('user_id', user.id).eq('active', true),
        supabase.from('ideas').select('id, context').eq('user_id', user.id),
        supabase.from('projects').select('id, title').eq('user_id', user.id).eq('status', 'active'),
      ])

      // Work / Home task summary
      const work = { total: 0, completed: 0, overdue: 0 }
      const home = { total: 0, completed: 0, overdue: 0 }

      if (items?.length) {
        const ids = items.map(i => i.id)
        const { data: comps } = await supabase
          .from('completions').select('item_id, completed')
          .in('item_id', ids).eq('log_date', date)

        const compMap = {}
        ;(comps || []).forEach(c => { compMap[c.item_id] = c.completed })

        items.forEach(item => {
          const bucket = item.context === 'work' ? work : home
          const completed = compMap[item.id] ?? false
          const overdue   = item.due_date && item.due_date < date && !completed
          bucket.total++
          if (completed) bucket.completed++
          if (overdue)   bucket.overdue++
        })
      }

      // Ideas summary
      const ideaList = ideas || []
      const ideasSummary = {
        inbox: ideaList.filter(i => !i.context).length,
        work:  ideaList.filter(i => i.context === 'work').length,
        home:  ideaList.filter(i => i.context === 'home').length,
        total: ideaList.length,
      }

      // Projects summary — overdue = has tasks with due_date < today and not completed
      const projectItems = (items || []).filter(i => i.project_id)
      const overdueProjectTaskIds = new Set()
      if (projectItems.length) {
        const ids = projectItems.map(i => i.id)
        const { data: comps } = await supabase
          .from('completions').select('item_id, completed')
          .in('item_id', ids).eq('log_date', date)
        const compMap = {}
        ;(comps || []).forEach(c => { compMap[c.item_id] = c.completed })
        projectItems.forEach(item => {
          if (item.due_date && item.due_date < date && !compMap[item.id]) {
            overdueProjectTaskIds.add(item.project_id)
          }
        })
      }

      const projectsSummary = {
        active:  (projects || []).length,
        overdue: overdueProjectTaskIds.size,
      }

      setSummary({ work, home, ideas: ideasSummary, projects: projectsSummary })
      setLoading(false)
    }

    load()
  }, [])

  return { summary, loading }
}
