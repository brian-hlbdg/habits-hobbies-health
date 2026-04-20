import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { useCarryForward } from '../hooks/useCarryForward'
import { today } from '../lib/supabase'
import Header from '../components/layout/Header'
import CategorySection from '../components/habits/CategorySection'
import NoteModal from '../components/ui/NoteModal'
import DueDateModal from '../components/ui/DueDateModal'
import AddItemModal from '../components/ui/AddItemModal'

// Preferred category order for Today view
const CATEGORY_ORDER = ['work', 'todo', 'daily', 'bills', 'website', 'personal', 'groceries', 'story', 'weekly', 'monthly', 'next_week']

export default function Today() {
  useCarryForward()

  const date = today()
  const { items, loading, toggle, saveNote, addItem, updateDueDate } = useItems('daily', date)

  const [noteItem, setNoteItem]       = useState(null)
  const [dueDateItem, setDueDateItem] = useState(null)
  const [showAdd, setShowAdd]         = useState(false)

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const completed = items.filter(i => i.completed).length
  const total     = items.length

  // Group by category, sorted by preferred order
  const groups = useMemo(() => {
    const map = {}
    items.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    const sorted = Object.keys(map).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a)
      const bi = CATEGORY_ORDER.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    return sorted.map(cat => ({ category: cat, items: map[cat] }))
  }, [items])

  return (
    <div className="max-w-xl mx-auto px-4">
      <Header title="Today" subtitle={dateLabel} completed={completed} total={total} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {groups.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No habits yet.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
              >
                Add your first item
              </button>
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

      {/* FAB — Add item */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition text-2xl leading-none"
        aria-label="Add item"
      >
        +
      </button>

      {/* Modals */}
      {noteItem && (
        <NoteModal item={noteItem} onSave={saveNote} onClose={() => setNoteItem(null)} />
      )}
      {dueDateItem && (
        <DueDateModal item={dueDateItem} onSave={updateDueDate} onClose={() => setDueDateItem(null)} />
      )}
      {showAdd && (
        <AddItemModal view="daily" onAdd={addItem} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}
