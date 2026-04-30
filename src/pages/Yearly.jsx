import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useItems'
import { today } from '../lib/supabase'
import Header from '../components/layout/Header'
import CategorySection from '../components/habits/CategorySection'
import NoteModal from '../components/ui/NoteModal'
import DueDateModal from '../components/ui/DueDateModal'

export default function Yearly() {
  const date = today()
  const { items, loading, toggle, saveNote, addItem, updateDueDate } = useItems('yearly', date)

  const [noteItem, setNoteItem]       = useState(null)
  const [dueDateItem, setDueDateItem] = useState(null)

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

      {noteItem    && <NoteModal item={noteItem} onSave={saveNote} onClose={() => setNoteItem(null)} />}
      {dueDateItem && <DueDateModal item={dueDateItem} onSave={updateDueDate} onClose={() => setDueDateItem(null)} />}
    </div>
  )
}
