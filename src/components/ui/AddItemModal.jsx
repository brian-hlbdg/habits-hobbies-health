import { useState } from 'react'

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
  { value: 'todo',      label: 'To Do' },
  { value: 'work',      label: 'Work' },
  { value: 'bills',     label: 'Bills' },
  { value: 'website',   label: 'Website' },
  { value: 'personal',  label: 'Personal' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'story',     label: 'Story — Eternal Echoes' },
]

const CONTEXT_DEFAULT = {
  work: 'work', website: 'work', bills: 'work',
}

// view → default frequency label for recurring tasks
const FREQ_LABEL = {
  daily: 'Repeats daily',
  weekly: 'Repeats weekly',
  monthly: 'Repeats monthly',
  yearly: 'Repeats yearly',
}

export default function AddItemModal({ view, onAdd, onClose }) {
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState('todo')
  const [context, setContext]     = useState('home')
  const [dueDate, setDueDate]     = useState('')
  const [recurring, setRecurring] = useState(false)

  function handleCategoryChange(val) {
    setCategory(val)
    setContext(CONTEXT_DEFAULT[val] ?? 'home')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      title:        title.trim(),
      category,
      context,
      is_recurring: recurring,
      due_date:     recurring ? null : (dueDate || null),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl p-5 slide-up shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-zinc-100">Add task</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              To build a behavior over time, use the Habits page
            </p>
          </div>
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
            placeholder="What needs to get done?"
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Category</label>
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-zinc-800 dark:text-white"
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
                    context === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
          <button
            type="button"
            onClick={() => setRecurring(r => !r)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition ${
              recurring
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
            }`}
          >
            <span className="font-medium">
              {recurring ? FREQ_LABEL[view] ?? 'Recurring task' : 'One-time task'}
            </span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {recurring ? 'tap to make one-time' : 'tap to make recurring'}
            </span>
          </button>

          {!recurring && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">
                Due date <span className="text-gray-300 dark:text-zinc-600">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            Add task
          </button>
        </form>
      </div>
    </div>
  )
}
