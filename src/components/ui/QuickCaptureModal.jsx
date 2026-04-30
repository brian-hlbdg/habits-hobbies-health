import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { today } from '../../lib/supabase'

const TYPE_HINTS = {
  task:  'Lands in your daily list. Edit details on the Today page.',
  idea:  'Goes to your Ideas inbox. Assign context later.',
  habit: 'Creates a daily habit. Update settings on the Habits page.',
}

export default function QuickCaptureModal({ onClose }) {
  const [title, setTitle]   = useState('')
  const [type, setType]     = useState('task')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (type === 'idea') {
      await supabase.from('ideas').insert({
        user_id: user.id,
        title: title.trim(),
      })
    } else if (type === 'task') {
      await supabase.from('items').insert({
        user_id: user.id,
        title: title.trim(),
        category: 'todo',
        context: 'home',
        type: 'task',
        view: 'daily',
        frequency: 'daily',
        is_recurring: false,
        order_index: 9999,
      })
    } else if (type === 'habit') {
      await supabase.from('items').insert({
        user_id: user.id,
        title: title.trim(),
        category: 'daily',
        context: 'home',
        type: 'habit',
        view: 'daily',
        frequency: 'daily',
        is_recurring: true,
        active: true,
        order_index: 9999,
      })
    }

    onClose()
  }

  const types = [
    { value: 'task',  label: 'Task' },
    { value: 'idea',  label: 'Idea' },
    { value: 'habit', label: 'Habit' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl p-5 slide-up shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-zinc-100">Quick capture</h3>
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
            placeholder="What's on your mind?"
            className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />

          <div className="flex gap-2">
            {types.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  type === t.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-zinc-500 min-h-[1rem]">
            {TYPE_HINTS[type]}
          </p>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            Capture
          </button>
        </form>
      </div>
    </div>
  )
}
