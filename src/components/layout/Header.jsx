/**
 * Page header: title, date label, circular progress ring
 */
export default function Header({ title, subtitle, completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct / 100)

  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {total > 0 && (
        <div className="relative flex items-center justify-center">
          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
            <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle
              cx="28" cy="28" r={r} fill="none"
              stroke="#4f46e5" strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <span className="absolute text-xs font-semibold text-gray-700">{pct}%</span>
        </div>
      )}
    </div>
  )
}
