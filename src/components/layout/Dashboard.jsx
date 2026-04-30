import { useDashboard } from '../../hooks/useDashboard'

const CONTEXTS = [
  { value: 'work', label: '💼 Work' },
  { value: 'all',  label: '⊕ All' },
  { value: 'home', label: '🏠 Home' },
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

function ContextCard({ label, emoji, data, color, bg }) {
  if (!data) return <div className={`flex-1 rounded-2xl ${bg} h-20 animate-pulse`} />

  const { total, completed, overdue } = data
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={`flex-1 rounded-2xl ${bg} px-4 py-3 flex items-center gap-3`}>
      <div className="relative flex items-center justify-center">
        <ProgressRing completed={completed} total={total} color={color} />
        <span className="absolute text-[10px] font-bold text-gray-700">{pct}%</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{emoji} {label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">
          {completed}/{total} done
        </p>
        {overdue > 0 && (
          <p className="text-xs text-red-500 font-medium">{overdue} overdue</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ activeContext, onContextChange }) {
  const { summary, loading } = useDashboard()

  return (
    <div className="px-4 pt-5 pb-3 space-y-3">
      {/* Summary cards */}
      <div className="flex gap-3">
        <ContextCard
          label="Work"
          emoji="💼"
          data={loading ? null : summary.work}
          color="#4f46e5"
          bg="bg-indigo-50"
        />
        <ContextCard
          label="Home"
          emoji="🏠"
          data={loading ? null : summary.home}
          color="#10b981"
          bg="bg-emerald-50"
        />
      </div>

      {/* Context toggle */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {CONTEXTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onContextChange(value)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeContext === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
