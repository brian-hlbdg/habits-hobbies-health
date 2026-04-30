import { useDashboard } from '../../hooks/useDashboard'

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
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

function LayersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

const CONTEXTS = [
  { value: 'work', label: 'Work',   Icon: BriefcaseIcon },
  { value: 'all',  label: 'All',    Icon: LayersIcon },
  { value: 'home', label: 'Home',   Icon: HomeIcon },
]

function ProgressRing({ completed, total, color }) {
  const pct = total > 0 ? completed / total : 0
  const r = 16
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct)

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke={color} strokeWidth="3.5"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}

function ContextCard({ label, Icon, data, color, bg, iconColor, active, onClick }) {
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
        <span className="absolute text-[10px] font-bold text-gray-700">{pct}%</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{completed}/{total} done</p>
        <div className="flex gap-2 mt-0.5">
          {overdue > 0 && (
            <p className="text-xs text-red-500 font-medium">{overdue} overdue</p>
          )}
          {data.ideas > 0 && (
            <p className="text-xs text-indigo-400 font-medium">{data.ideas} ideas</p>
          )}
          {data.projects > 0 && (
            <p className="text-xs text-emerald-500 font-medium">{data.projects} projects</p>
          )}
        </div>
      </div>
    </button>
  )
}

export default function Dashboard({ activeContext, onContextChange }) {
  const { summary, loading } = useDashboard()

  return (
    <div className="px-4 pt-5 pb-3 space-y-3">
      <div className="flex gap-3">
        <ContextCard
          label="Work"
          Icon={BriefcaseIcon}
          data={loading ? null : summary.work}
          color="#4f46e5"
          bg="bg-indigo-50"
          iconColor="text-indigo-400"
          active={activeContext === 'work'}
          onClick={() => onContextChange(activeContext === 'work' ? 'all' : 'work')}
        />
        <ContextCard
          label="Home"
          Icon={HomeIcon}
          data={loading ? null : summary.home}
          color="#10b981"
          bg="bg-emerald-50"
          iconColor="text-emerald-400"
          active={activeContext === 'home'}
          onClick={() => onContextChange(activeContext === 'home' ? 'all' : 'home')}
        />
      </div>

      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {CONTEXTS.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => onContextChange(value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeContext === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
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
