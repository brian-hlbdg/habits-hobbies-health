import { useState } from 'react'
import { useIdeas } from '../hooks/useIdeas'
import { useProjects } from '../hooks/useProjects'

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

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IdeaCard({ idea, projects, onAssign, onPromote, onPromoteToHabit, onPromoteToProject, onDelete }) {
  const [showPromote, setShowPromote] = useState(false)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-700 p-4 shadow-sm dark:shadow-zinc-950 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{idea.title}</p>
          {idea.note && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{idea.note}</p>}
        </div>
        <button onClick={() => onDelete(idea.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition shrink-0">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Context assignment */}
      <div className="flex gap-2">
        <button
          onClick={() => onAssign(idea.id, 'work')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            idea.context === 'work'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-indigo-300'
          }`}
        >
          <BriefcaseIcon className="w-3.5 h-3.5" /> Work
        </button>
        <button
          onClick={() => onAssign(idea.id, 'home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            idea.context === 'home'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-emerald-300'
          }`}
        >
          <HomeIcon className="w-3.5 h-3.5" /> Home
        </button>

        {idea.context && (
          <button
            onClick={() => setShowPromote(p => !p)}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 transition"
          >
            Promote <ArrowRightIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Promote options */}
      {showPromote && idea.context && (
        <div className="border-t border-gray-100 dark:border-zinc-700 pt-3 space-y-2">
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Promote to:</p>
          <button
            onClick={() => onPromote(idea)}
            className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-xs text-gray-700 dark:text-zinc-300 transition"
          >
            Task — adds to today's list
          </button>
          <button
            onClick={() => onPromoteToHabit(idea)}
            className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-xs text-indigo-700 dark:text-indigo-300 transition"
          >
            Habit — track it daily on the Habits page
          </button>
          {idea.context === 'home' && projects.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 dark:text-zinc-500 pl-1">Or attach to a project:</p>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => onPromoteToProject(idea, p.id)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 transition"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Ideas() {
  const { ideas, loading, addIdea, assignContext, promoteToTask, promoteToHabit, promoteToProjectTask, deleteIdea } = useIdeas()
  const { projects } = useProjects()
  const [newIdea, setNewIdea] = useState('')

  async function handleQuickAdd(e) {
    e.preventDefault()
    if (!newIdea.trim()) return
    await addIdea(newIdea)
    setNewIdea('')
  }

  const unassigned = ideas.filter(i => !i.context)
  const workIdeas  = ideas.filter(i => i.context === 'work')
  const homeIdeas  = ideas.filter(i => i.context === 'home')

  function Group({ title, items, accent }) {
    if (!items.length) return null
    return (
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${accent}`}>{title}</p>
        <div className="space-y-2">
          {items.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              projects={projects}
              onAssign={assignContext}
              onPromote={promoteToTask}
              onPromoteToHabit={promoteToHabit}
              onPromoteToProject={promoteToProjectTask}
              onDelete={deleteIdea}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ideas</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Capture first, sort later</p>
      </div>

      {/* Quick capture */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newIdea}
          onChange={e => setNewIdea(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={!newIdea.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition"
        >
          Add
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-zinc-500 py-12">No ideas yet. Start capturing.</p>
      ) : (
        <div className="space-y-6">
          <Group title="Inbox" items={unassigned} accent="text-gray-400" />
          <Group title="Work" items={workIdeas} accent="text-indigo-500" />
          <Group title="Home" items={homeIdeas} accent="text-emerald-500" />
        </div>
      )}
    </div>
  )
}
