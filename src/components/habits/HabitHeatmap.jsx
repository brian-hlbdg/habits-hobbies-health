import { useHabitHistory } from '../../hooks/useHabitHistory'

function TrophyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17v4" /><path d="M8 21h8" />
      <path d="M6 3h12v8a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3z" />
    </svg>
  )
}

const MILESTONE_META = {
  7:   { label: '7 days',        color: 'bg-indigo-300 dark:bg-indigo-700',  text: 'text-indigo-700 dark:text-indigo-300',  celebrate: '7-day streak' },
  21:  { label: '3 weeks',       color: 'bg-indigo-400 dark:bg-indigo-600',  text: 'text-indigo-800 dark:text-indigo-200',  celebrate: '3 weeks straight' },
  30:  { label: '1 month',       color: 'bg-violet-400 dark:bg-violet-600',  text: 'text-violet-800 dark:text-violet-200',  celebrate: 'One full month' },
  66:  { label: 'Habit formed',  color: 'bg-violet-600 dark:bg-violet-500',  text: 'text-violet-900 dark:text-violet-100',  celebrate: 'Habit formed — 66 days' },
  100: { label: '100 days',      color: 'bg-purple-600 dark:bg-purple-500',  text: 'text-purple-900 dark:text-purple-100',  celebrate: '100 days' },
  365: { label: 'One year',      color: 'bg-amber-500 dark:bg-amber-400',    text: 'text-amber-900 dark:text-amber-900',    celebrate: 'One full year' },
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function cellColor(completed) {
  if (completed === null)  return 'bg-transparent'
  if (!completed)          return 'bg-gray-100 dark:bg-zinc-800'
  return 'bg-indigo-500 dark:bg-indigo-400'
}

export default function HabitHeatmap({ habitId, habitTitle, completed, onToggle, onRemove, onEdit }) {
  const { grid, streak, bestStreak, milestones, newMilestone, daysSinceLastCompletion, loading } = useHabitHistory(habitId)

  // Group cells into columns (weeks)
  const cols = []
  if (grid.length) {
    const numCols = Math.max(...grid.map(c => c.col)) + 1
    for (let c = 0; c < numCols; c++) {
      cols.push(grid.filter(cell => cell.col === c).sort((a, b) => a.row - b.row))
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Today's toggle */}
          <button
            onClick={() => onToggle(habitId)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
              completed
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 dark:border-zinc-600 hover:border-indigo-400'
            }`}
          >
            {completed && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </button>
          <span className={`text-sm font-semibold truncate ${completed ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-900 dark:text-white'}`}>
            {habitTitle}
          </span>
        </div>

        {/* Streak + edit */}
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 transition"
              aria-label="Edit habit"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none">{streak}</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none mt-0.5">day streak</p>
          </div>
        </div>
      </div>

      {/* Milestone celebration banner — shown when streak hits a threshold today */}
      {newMilestone && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
          <TrophyIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {MILESTONE_META[newMilestone].celebrate} of {habitTitle}
          </p>
        </div>
      )}

      {/* Dormancy warning — 7+ days without completion */}
      {!newMilestone && daysSinceLastCompletion !== null && daysSinceLastCompletion >= 7 && (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-amber-50 dark:bg-zinc-800 rounded-xl border border-amber-100 dark:border-zinc-700">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {daysSinceLastCompletion} days since last check-in. Still tracking this?
          </p>
          {onRemove && (
            <button
              onClick={() => onRemove(habitId)}
              className="text-xs text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 shrink-0 transition"
            >
              Archive
            </button>
          )}
        </div>
      )}

      {/* Milestone badges */}
      {milestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {milestones.map(t => {
            const m = MILESTONE_META[t]
            return (
              <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.color} ${m.text}`}>
                {m.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Heatmap grid */}
      {loading ? (
        <div className="h-16 bg-gray-50 dark:bg-zinc-800 rounded-lg animate-pulse" />
      ) : (
        <div className="flex gap-0.5 overflow-hidden">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 justify-around">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="text-[9px] text-gray-300 dark:text-zinc-600 w-3 text-center leading-none" style={{ height: 10 }}>
                {i % 2 === 1 ? d : ''}
              </span>
            ))}
          </div>
          {/* Week columns */}
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-0.5 flex-1">
              {col.map((cell, ri) => (
                <div
                  key={ri}
                  title={cell.date}
                  className={`rounded-sm ${cellColor(cell.completed)}`}
                  style={{ aspectRatio: '1 / 1' }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Best streak footnote */}
      {bestStreak > 0 && bestStreak !== streak && (
        <p className="text-[10px] text-gray-300 dark:text-zinc-600">
          Best streak: {bestStreak} days
        </p>
      )}
    </div>
  )
}
