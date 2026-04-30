import { useHabitHistory } from '../../hooks/useHabitHistory'

const MILESTONE_META = {
  7:   { label: '7 days',        color: 'bg-indigo-300 dark:bg-indigo-700',  text: 'text-indigo-700 dark:text-indigo-300' },
  21:  { label: '3 weeks',       color: 'bg-indigo-400 dark:bg-indigo-600',  text: 'text-indigo-800 dark:text-indigo-200' },
  30:  { label: '1 month',       color: 'bg-violet-400 dark:bg-violet-600',  text: 'text-violet-800 dark:text-violet-200' },
  66:  { label: 'Habit formed',  color: 'bg-violet-600 dark:bg-violet-500',  text: 'text-violet-900 dark:text-violet-100' },
  100: { label: '100 days',      color: 'bg-purple-600 dark:bg-purple-500',  text: 'text-purple-900 dark:text-purple-100' },
  365: { label: 'One year',      color: 'bg-amber-500 dark:bg-amber-400',    text: 'text-amber-900 dark:text-amber-900'   },
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function cellColor(completed) {
  if (completed === null)  return 'bg-transparent'
  if (!completed)          return 'bg-gray-100 dark:bg-zinc-800'
  return 'bg-indigo-500 dark:bg-indigo-400'
}

export default function HabitHeatmap({ habitId, habitTitle, completed, onToggle }) {
  const { grid, streak, bestStreak, milestones, loading } = useHabitHistory(habitId)

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

        {/* Streak */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none">{streak}</p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none mt-0.5">day streak</p>
        </div>
      </div>

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
