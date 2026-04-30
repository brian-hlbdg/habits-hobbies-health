import { useState, useEffect } from 'react'

export default function NoteModal({ item, onSave, onClose }) {
  const [text, setText] = useState(item?.note || '')

  useEffect(() => { setText(item?.note || '') }, [item])

  if (!item) return null

  function handleSave() {
    onSave(item.id, text)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl p-5 slide-up shadow-xl dark:shadow-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate pr-4">{item.title}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note…"
          rows={4}
          className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 p-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
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
