import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { useWeeklyReview } from '../hooks/useWeeklyReview'
import { today } from '../lib/supabase'
import Header from '../components/layout/Header'
import CategorySection from '../components/habits/CategorySection'
import NoteModal from '../components/ui/NoteModal'
import DueDateModal from '../components/ui/DueDateModal'

const VIEW_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }

function WeeklyReview({ habitStats, completedTasks, loading }) {
  const [open, setOpen] = useState(false)
  if (loading) return null
  if (!habitStats.length && !completedTasks.length) return null

  const overall    = habitStats.reduce((s, h) => s + h.daysCompleted, 0)
  const possible   = habitStats.reduce((s, h) => s + h.daysTotal, 0)
  const overallPct = possible > 0 ? Math.round((overall / possible) * 100) : 0
  const struggling = habitStats.filter(h => h.pct < 50)

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Week in review</span>
          {habitStats.length > 0 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              overallPct >= 70
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : overallPct >= 40
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                : 'bg-red-50 dark:bg-zinc-800 text-red-500 dark:text-red-400'
            }`}>
              {overallPct}% habits
            </span>
          )}
          {completedTasks.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
              {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800">

          {/* Tasks completed this week */}
          {completedTasks.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 mb-2">Completed</p>
              {completedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-zinc-300 flex-1 truncate">{t.title}</span>
                  <span className="text-[10px] text-gray-300 dark:text-zinc-600 shrink-0">{VIEW_LABEL[t.view] ?? t.view}</span>
                </div>
              ))}
            </div>
          )}

          {/* Habits this week */}
          {habitStats.length > 0 && (
            <div className="px-4 py-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Habits</p>
              {habitStats.map(h => (
                <div key={h.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 dark:text-zinc-300 truncate flex-1 pr-2">{h.title}</span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">{h.daysCompleted}/{h.daysTotal} days</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        h.pct >= 70 ? 'bg-emerald-500' : h.pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${h.pct}%` }}
                    />
                  </div>
                </div>
              ))}

              {struggling.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 pt-1">
                  Needs attention: {struggling.map(h => h.title).join(', ')}
                </p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function weekLabel() {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function Weekly() {
  const date = today()
  const { items, loading, toggle, saveNote, updateDueDate } = useItems('weekly', date)
  const { habitStats, completedTasks, loading: reviewLoading } = useWeeklyReview()

  const [noteItem, setNoteItem]       = useState(null)
  const [dueDateItem, setDueDateItem] = useState(null)

  const completed = items.filter(i => i.completed).length
  const total     = items.length

  const groups = useMemo(() => {
    const map = {}
    items.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    return Object.keys(map).map(cat => ({ category: cat, items: map[cat] }))
  }, [items])

  return (
    <div className="max-w-xl mx-auto px-4">
      <Header title="This Week" subtitle={weekLabel()} completed={completed} total={total} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {groups.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No weekly items yet.</p>
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

      <WeeklyReview habitStats={habitStats} completedTasks={completedTasks} loading={reviewLoading} />

      {noteItem    && <NoteModal item={noteItem} onSave={saveNote} onClose={() => setNoteItem(null)} />}
      {dueDateItem && <DueDateModal item={dueDateItem} onSave={updateDueDate} onClose={() => setDueDateItem(null)} />}
    </div>
  )
}
