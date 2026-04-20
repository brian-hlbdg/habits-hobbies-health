import { today } from '../lib/supabase'

/**
 * Returns urgency level for a planned task (is_recurring = false).
 * Returns null for recurring habits or completed items.
 *
 * Levels:
 *   null      — no due date, or recurring, or already completed
 *   'warning' — 1–3 days until due
 *   'urgent'  — due today
 *   'overdue' — past due date
 */
export function useUrgency(item) {
  if (!item || item.is_recurring || item.completed || !item.due_date) return null

  const todayStr = today()
  if (item.due_date < todayStr) return 'overdue'
  if (item.due_date === todayStr) return 'urgent'

  const diffMs  = new Date(item.due_date).getTime() - new Date(todayStr).getTime()
  const diffDays = Math.ceil(diffMs / 86_400_000)
  if (diffDays <= 3) return 'warning'

  return null
}

/** Tailwind classes per urgency level, applied to the item row */
export const urgencyItemClasses = {
  warning: 'border-l-4 border-amber-400 pl-3',
  urgent:  'border-l-4 border-red-500 pl-3',
  overdue: 'border-l-4 border-red-600 pl-3',
}

/** Tailwind classes per urgency level, applied to the category card */
export const urgencyCategoryClasses = {
  warning: '',                                          // no category-level change for warning
  urgent:  'bg-red-50 border-red-200',
  overdue: 'bg-red-50 border-red-200',
}

/** Text color for due date chip */
export const urgencyTextClasses = {
  warning: 'text-amber-600 bg-amber-50',
  urgent:  'text-red-600 bg-red-50',
  overdue: 'text-red-700 bg-red-100 font-semibold',
}
