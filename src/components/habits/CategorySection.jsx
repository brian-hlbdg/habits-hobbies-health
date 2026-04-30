import { useState } from 'react'
import HabitItem from './HabitItem'
import ProgressBar from './ProgressBar'
import { urgencyCategoryClasses } from '../../hooks/useUrgency'

/** Category labels → display names */
const CATEGORY_LABELS = {
  work:       'Work',
  todo:       'To Do',
  website:    'Website',
  daily:      'Daily',
  weekly:     'Weekly',
  bills:      'Bills',
  next_week:  'Next Week',
  personal:   'Personal',
  monthly:    'Monthly',
  groceries:  'Groceries',
  story:      'Story — Eternal Echoes',
}

export default function CategorySection({ category, items, onToggle, onNoteClick, onDueDateClick }) {
  const [open, setOpen] = useState(true)

  const completed = items.filter(i => i.completed).length
  const total     = items.length

  // Determine highest urgency across all incomplete items in this category
  // to decide category-level background
  const hasOverdue  = items.some(i => !i.is_recurring && !i.completed && i.due_date && i.due_date < today())
  const hasUrgent   = items.some(i => !i.is_recurring && !i.completed && i.due_date && i.due_date === today())
  const catUrgency  = hasOverdue ? 'overdue' : hasUrgent ? 'urgent' : null

  const cardClass = [
    'rounded-xl border mb-3 overflow-hidden transition-colors',
    catUrgency ? urgencyCategoryClasses[catUrgency] : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800',
  ].join(' ')

  return (
    <div className={cardClass}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wide">
            {CATEGORY_LABELS[category] || category}
          </span>
          <ProgressBar completed={completed} total={total} />
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-zinc-500 ml-3 flex-shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Items */}
      {open && (
        <div className="px-4 pb-3 space-y-0.5">
          {items.map(item => (
            <HabitItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onNoteClick={onNoteClick}
              onDueDateClick={onDueDateClick}
            />
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 py-2">No items yet</p>
          )}
        </div>
      )}
    </div>
  )
}

function today() {
  return new Date().toLocaleDateString('en-CA')
}
