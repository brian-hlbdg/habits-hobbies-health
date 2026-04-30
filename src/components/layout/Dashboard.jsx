import { Link } from 'react-router-dom'
import { useDashboard } from '../../hooks/useDashboard'

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function LightbulbIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2L15 17H9l-.5-1.8A7 7 0 0 1 12 2z" />
    </svg>
  )
}

function FolderIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function LayersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

// ─── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ completed, total, color }) {
  const pct  = total > 0 ? completed / total : 0
  const r    = 16
  const circ = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke={color} strokeWidth="3.5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}

// ─── Task context card (Work / Home) ──────────────────────────────────────────

function TaskCard({ label, Icon, data, color, bg, iconColor, active, onClick }) {
  if (!data) return <div className={`flex-1 rounded-2xl ${bg} h-20 animate-pulse`} />
  const { total, completed, overdue } = data
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl ${bg} px-4 py-3 flex items-center gap-3 text-left transition ring-2 ${
        active ? 'ring-current opacity-100' : 'ring-transparent opacity-80 hover:opacity-100'
      }`}
      style={{ '--tw-ring-color': color }}
    >
      <div className="relative flex items-center justify-center">
        <ProgressRing completed={completed} total={total} color={color} />
        <span className="absolute text-[10px] font-bold text-gray-700 dark:text-zinc-300">{pct}%</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{completed}/{total} done</p>
        {overdue > 0 && (
          <p className="text-xs text-red-500 font-medium">{overdue} overdue</p>
        )}
      </div>
    </button>
  )
}

// ─── Ideas card ───────────────────────────────────────────────────────────────

function IdeasCard({ data }) {
  if (!data) return <div className="flex-1 rounded-2xl bg-amber-50 dark:bg-zinc-900 h-16 animate-pulse" />
  const { total, inbox, work, home } = data

  return (
    <Link
      to="/ideas"
      className="flex-1 rounded-2xl bg-amber-50 dark:bg-zinc-900 px-4 py-3 flex items-center gap-3 hover:opacity-90 transition"
    >
      <LightbulbIcon className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Ideas</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{total} in queue</p>
        {inbox > 0 && (
          <p className="text-xs text-amber-600 font-medium">{inbox} unsorted</p>
        )}
        {total === 0 && (
          <p className="text-xs text-gray-400 dark:text-zinc-500">Tap to capture</p>
        )}
      </div>
    </Link>
  )
}

// ─── Projects card ────────────────────────────────────────────────────────────

function ProjectsCard({ data }) {
  if (!data) return <div className="flex-1 rounded-2xl bg-emerald-50 dark:bg-zinc-900 h-16 animate-pulse" />
  const { active, overdue } = data

  return (
    <Link
      to="/projects"
      className="flex-1 rounded-2xl bg-emerald-50 dark:bg-zinc-900 px-4 py-3 flex items-center gap-3 hover:opacity-90 transition"
    >
      <FolderIcon className="w-5 h-5 text-emerald-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Projects</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
          {active} active
        </p>
        {overdue > 0 && (
          <p className="text-xs text-red-500 font-medium">{overdue} with overdue tasks</p>
        )}
        {active === 0 && (
          <p className="text-xs text-gray-400 dark:text-zinc-500">Tap to create one</p>
        )}
      </div>
    </Link>
  )
}

// ─── Context toggle ───────────────────────────────────────────────────────────

const CONTEXTS = [
  { value: 'work', label: 'Work', Icon: BriefcaseIcon },
  { value: 'all',  label: 'All',  Icon: LayersIcon },
  { value: 'home', label: 'Home', Icon: HomeIcon },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ activeContext, onContextChange }) {
  const { summary, loading } = useDashboard()

  return (
    <div className="px-4 pt-5 pb-3 space-y-2">
      {/* Row 1: Work / Home task cards */}
      <div className="flex gap-2">
        <TaskCard
          label="Work"
          Icon={BriefcaseIcon}
          data={loading ? null : summary?.work}
          color="#4f46e5"
          bg="bg-indigo-50 dark:bg-zinc-900"
          iconColor="text-indigo-400"
          active={activeContext === 'work'}
          onClick={() => onContextChange(activeContext === 'work' ? 'all' : 'work')}
        />
        <TaskCard
          label="Home"
          Icon={HomeIcon}
          data={loading ? null : summary?.home}
          color="#10b981"
          bg="bg-emerald-50 dark:bg-zinc-900"
          iconColor="text-emerald-400"
          active={activeContext === 'home'}
          onClick={() => onContextChange(activeContext === 'home' ? 'all' : 'home')}
        />
      </div>

      {/* Row 2: Ideas / Projects cards */}
      <div className="flex gap-2">
        <IdeasCard    data={loading ? null : summary?.ideas} />
        <ProjectsCard data={loading ? null : summary?.projects} />
      </div>

      {/* Context toggle */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-900 p-1 gap-1">
        {CONTEXTS.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => onContextChange(value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeContext === value
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
