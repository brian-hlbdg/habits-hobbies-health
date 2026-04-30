import { useState } from 'react'
import { useStreak } from '../../hooks/useStreak'
import { useUrgency, urgencyItemClasses, urgencyTextClasses } from '../../hooks/useUrgency'

export default function HabitItem({ item, onToggle, onNoteClick, onDueDateClick }) {
  const streak  = useStreak(item.is_recurring ? item.id : null)
  const urgency = useUrgency(item)
  const [popping, setPopping] = useState(false)

  function handleToggle() {
    setPopping(true)
    onToggle(item.id)
    setTimeout(() => setPopping(false), 200)
  }

  const itemClass = [
    'flex items-start gap-3 py-2.5 px-1 rounded-lg transition-colors',
    urgency ? urgencyItemClasses[urgency] : '',
  ].join(' ')

  return (
    <div className={itemClass}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${popping ? 'check-pop' : ''} ${
          item.completed
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
        }`}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm leading-snug ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
            {item.title}
          </span>

          {/* Carry-forward badge */}
          {item.carried_forward && !item.completed && (
            <span className="text-xs text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">↩ yesterday</span>
          )}

          {/* Due date chip */}
          {!item.is_recurring && item.due_date && (
            <button
              onClick={() => onDueDateClick?.(item)}
              className={`text-xs px-1.5 py-0.5 rounded transition ${
                urgency ? urgencyTextClasses[urgency] : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {formatDate(item.due_date)}
            </button>
          )}

          {/* Streak flame */}
          {streak >= 2 && (
            <span className="text-xs text-orange-500 flex items-center gap-0.5">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Note icon */}
      <button
        onClick={() => onNoteClick?.(item)}
        className={`flex-shrink-0 p-1 rounded transition-colors ${
          item.note ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'
        }`}
        aria-label="Add note"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
