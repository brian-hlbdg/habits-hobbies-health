import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useProjectItems } from '../hooks/useProjectItems'

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function FlagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

function ProjectCard({ project, onComplete }) {
  const { items, loading, addTask, toggleTask, removeTask } = useProjectItems(project.id)
  const [expanded, setExpanded] = useState(true)
  const [newTask, setNewTask]   = useState('')
  const [adding, setAdding]     = useState(false)

  const total     = items.length
  const completed = items.filter(i => i.completed).length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    await addTask(newTask)
    setNewTask('')
    setAdding(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{project.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{completed}/{total} tasks done</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {/* Progress pill */}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            pct === 100 ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}>
            {pct}%
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-gray-800">
        <div
          className="h-1 bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Task list */}
      {expanded && (
        <div className="px-4 py-3 space-y-1">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-1.5 group">
                  <button
                    onClick={() => toggleTask(item.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                    }`}
                  >
                    {item.completed && <CheckIcon className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.title}
                  </span>
                  <button
                    onClick={() => removeTask(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-400 transition"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {items.length === 0 && !adding && (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No tasks yet.</p>
              )}

              {/* Add task */}
              {adding ? (
                <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
                  <input
                    autoFocus
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    placeholder="Task name"
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 px-3 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition pt-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add task
                </button>
              )}
            </>
          )}

          {/* Mark project done */}
          <div className="pt-3 border-t border-gray-50 dark:border-gray-700 mt-2">
            <button
              onClick={() => onComplete(project.id)}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-emerald-600 transition"
            >
              <FlagIcon className="w-3.5 h-3.5" /> Mark project complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Projects() {
  const { projects, loading, addProject, completeProject } = useProjects()
  const [newProject, setNewProject] = useState('')
  const [adding, setAdding]         = useState(false)

  async function handleAddProject(e) {
    e.preventDefault()
    if (!newProject.trim()) return
    await addProject(newProject)
    setNewProject('')
    setAdding(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Home projects & multi-step tasks</p>
        </div>
        <button
          onClick={() => setAdding(p => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <PlusIcon className="w-4 h-4" /> New
        </button>
      </div>

      {/* New project form */}
      {adding && (
        <form onSubmit={handleAddProject} className="flex gap-2 mb-4">
          <input
            autoFocus
            type="text"
            value={newProject}
            onChange={e => setNewProject(e.target.value)}
            placeholder="Project name (e.g. Paint bedroom)"
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={!newProject.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition"
          >
            Create
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No active projects.</p>
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-emerald-600 text-sm font-medium hover:underline"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onComplete={completeProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
