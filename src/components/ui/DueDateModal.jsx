import { useState } from 'react'

export default function DueDateModal({ item, onSave, onClose }) {
  const [date, setDate] = useState(item?.due_date || '')

  if (!item) return null

  function handleSave() {
    onSave(item.id, date)
    onClose()
  }

  function handleClear() {
    onSave(item.id, null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl p-5 slide-up shadow-xl dark:shadow-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate pr-4">Due date</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{item.title}</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="flex gap-2 mt-4">
          {item.due_date && (
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
