import { useState, useEffect } from 'react'
import { supabase, today } from '../lib/supabase'

/**
 * Fetches a summary of today's items grouped by context (work/home).
 * Returns counts for total, completed, and overdue.
 */
export function useDashboard() {
  const [summary, setSummary] = useState({ work: null, home: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const date = today()

      const { data: items } = await supabase
        .from('items')
        .select('id, context, due_date')
        .eq('user_id', user.id)
        .eq('active', true)

      if (!items?.length) {
        setSummary({ work: empty(), home: empty() })
        setLoading(false)
        return
      }

      const ids = items.map(i => i.id)
      const { data: comps } = await supabase
        .from('completions')
        .select('item_id, completed')
        .in('item_id', ids)
        .eq('log_date', date)

      const compMap = {}
      ;(comps || []).forEach(c => { compMap[c.item_id] = c.completed })

      const result = { work: empty(), home: empty() }

      items.forEach(item => {
        const ctx = item.context || 'home'
        const completed = compMap[item.id] ?? false
        const overdue = item.due_date && item.due_date < date && !completed

        result[ctx].total++
        if (completed) result[ctx].completed++
        if (overdue)   result[ctx].overdue++
      })

      setSummary(result)
      setLoading(false)
    }

    load()
  }, [])

  return { summary, loading }
}

function empty() {
  return { total: 0, completed: 0, overdue: 0 }
}
