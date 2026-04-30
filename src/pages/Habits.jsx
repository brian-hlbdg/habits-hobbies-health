import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import HabitHeatmap from '../components/habits/HabitHeatmap'

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 12h20" />
    </svg>
  )
}

function HomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

const CATEGORIES = [
  { value: 'daily',     label: 'Daily' },
  { value: 'health',    label: 'Health' },
  { value: 'personal',  label: 'Personal' },
  { value: 'work',      label: 'Work' },
  { value: 'website',   label: 'Website' },
  { value: 'story',     label: 'Story' },
]

const FREQUENCIES = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

function AddHabitForm({ onAdd, onClose }) {
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState('daily')
  const [context, setContext]     = useState('home')
  const [frequency, setFrequency] = useState('daily')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), category, context, frequency })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl p-5 slide-up shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-zinc-100">New habit</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What habit do you want to build?"
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Context</label>
            <div className="flex gap-2">
              {[
                { value: 'work', label: 'Work', Icon: BriefcaseIcon },
                { value: 'home', label: 'Home', Icon: HomeIcon },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContext(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition ${
                    context === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    frequency === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            Create habit
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Habits() {
  const { habits, loading, toggle, addHabit, removeHabit } = useHabits()
  const [showAdd, setShowAdd] = useState(false)

  const done  = habits.filter(h => h.completed).length
  const total = habits.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  // Group by context
  const workHabits = habits.filter(h => h.context === 'work')
  const homeHabits = habits.filter(h => h.context === 'home')

  function HabitGroup({ title, items, accent }) {
    if (!items.length) return null
    return (
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${accent}`}>{title}</p>
        <div className="space-y-3">
          {items.map(h => (
            <HabitHeatmap
              key={h.id}
              habitId={h.id}
              habitTitle={h.title}
              completed={h.completed}
              onToggle={toggle}
              onRemove={removeHabit}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Habits</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Build consistency, not streaks</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-4 h-4" /> New
        </button>
      </div>

      {/* Today's progress */}
      {total > 0 && (
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">{done}/{total} today</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-zinc-500 text-sm">No habits yet.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
          >
            Create your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <HabitGroup title="Work" items={workHabits} accent="text-indigo-500" />
          <HabitGroup title="Home" items={homeHabits} accent="text-emerald-500" />
        </div>
      )}

      {showAdd && <AddHabitForm onAdd={addHabit} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
