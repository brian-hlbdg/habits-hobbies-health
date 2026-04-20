import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { today } from '../lib/supabase'
import Header from '../components/layout/Header'
import CategorySection from '../components/habits/CategorySection'
import NoteModal from '../components/ui/NoteModal'
import DueDateModal from '../components/ui/DueDateModal'
import AddItemModal from '../components/ui/AddItemModal'

export default function Yearly() {
  const date = today()
  const { items, loading, toggle, saveNote, addItem, updateDueDate } = useItems('yearly', date)

  const [noteItem, setNoteItem]       = useState(null)
  const [dueDateItem, setDueDateItem] = useState(null)
  const [showAdd, setShowAdd]         = useState(false)

  const year      = new Date().getFullYear()
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
      <Header
        title={`${year} Goals`}
        subtitle="Long-horizon focus"
        completed={completed}
        total={total}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {groups.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No yearly goals yet.</p>
              <p className="text-gray-400 text-xs mt-1">Add big things you want to accomplish this year.</p>
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

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition text-2xl leading-none"
        aria-label="Add goal"
      >
        +
      </button>

      {noteItem    && <NoteModal item={noteItem} onSave={saveNote} onClose={() => setNoteItem(null)} />}
      {dueDateItem && <DueDateModal item={dueDateItem} onSave={updateDueDate} onClose={() => setDueDateItem(null)} />}
      {showAdd     && <AddItemModal view="yearly" onAdd={addItem} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
