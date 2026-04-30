import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { useCarryForward } from '../hooks/useCarryForward'
import { useHabitCelebrations } from '../hooks/useHabitCelebrations'
import { useOverdueTasks } from '../hooks/useOverdueTasks'
import { today } from '../lib/supabase'
import Header from '../components/layout/Header'
import Dashboard from '../components/layout/Dashboard'
import CategorySection from '../components/habits/CategorySection'
import NoteModal from '../components/ui/NoteModal'
import DueDateModal from '../components/ui/DueDateModal'

const MILESTONE_LABELS = {
  7:   '7-day streak',
  21:  '3 weeks straight',
  30:  'One full month',
  66:  'Habit formed — 66 days',
  100: '100 days',
  365: 'One full year',
}

function TrophyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17v4" /><path d="M8 21h8" />
      <path d="M6 3h12v8a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3z" />
    </svg>
  )
}

function CelebrationStrip({ celebrations }) {
  if (!celebrations.length) return null
  return (
    <div className="px-4 pb-3 space-y-2">
      {celebrations.map(c => (
        <div
          key={c.habitId}
          className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900"
        >
          <TrophyIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {MILESTONE_LABELS[c.milestone]}
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-0.5">
              Today you hit day {c.streak} of {c.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Preferred category order for Today view
const CATEGORY_ORDER = ['work', 'todo', 'daily', 'bills', 'website', 'personal', 'groceries', 'story', 'weekly', 'monthly', 'next_week']

export default function Today() {
  useCarryForward()

  const celebrations = useHabitCelebrations()
  const { overdue, complete: completeOverdue } = useOverdueTasks()
  const date = today()
  const { items, loading, toggle, saveNote, updateDueDate } = useItems('daily', date)

  const [noteItem, setNoteItem]       = useState(null)
  const [dueDateItem, setDueDateItem] = useState(null)
  const [context, setContext]         = useState('all')

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // Filter by context then group by category
  const visibleItems = useMemo(() =>
    context === 'all' ? items : items.filter(i => i.context === context),
    [items, context]
  )

  const completed = visibleItems.filter(i => i.completed).length
  const total     = visibleItems.length

  // Group by category, sorted by preferred order
  const groups = useMemo(() => {
    const map = {}
    visibleItems.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    const sorted = Object.keys(map).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a)
      const bi = CATEGORY_ORDER.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    return sorted.map(cat => ({ category: cat, items: map[cat] }))
  }, [visibleItems])

  return (
    <div className="max-w-xl mx-auto">
      <Dashboard activeContext={context} onContextChange={setContext} />
      <CelebrationStrip celebrations={celebrations} />
      <Header title="Today" subtitle={dateLabel} completed={completed} total={total} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overdue tasks from Week/Month/Year */}
          {overdue.length > 0 && (
            <div className="px-4 mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400 dark:text-red-500 mb-2">Overdue</p>
              <div className="space-y-2">
                {overdue.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-red-100 dark:border-zinc-700">
                    <button
                      onClick={() => completeOverdue(item.id)}
                      className="w-5 h-5 rounded-full border-2 border-red-300 dark:border-red-700 hover:border-red-500 shrink-0 transition"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-zinc-200 truncate">{item.title}</p>
                      <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">
                        Due {new Date(item.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {item.view}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups.length === 0 && overdue.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 dark:text-zinc-500 text-sm">Nothing on the list.</p>
            </div>
          )}

          {groups.map(({ category, items: catItems }) => (
            <CategorySection
              key={category}
              category={category}
              items={catItems}
              onToggle={toggle}
              onNoteClick={setNoteItem}
              onDueDateClick={setDueDateItem}
            />
          ))}
        </>
      )}

      {/* Modals */}
      {noteItem && (
        <NoteModal item={noteItem} onSave={saveNote} onClose={() => setNoteItem(null)} />
      )}
      {dueDateItem && (
        <DueDateModal item={dueDateItem} onSave={updateDueDate} onClose={() => setDueDateItem(null)} />
      )}
    </div>
  )
}
