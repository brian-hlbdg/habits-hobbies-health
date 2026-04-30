import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const links = [
  { to: '/',        label: 'Today',   icon: SunIcon },
  { to: '/weekly',  label: 'Tasks',   icon: CalIcon },
  { to: '/habits',  label: 'Habits',  icon: RepeatIcon },
  { to: '/ideas',   label: 'Ideas',   icon: LightbulbIcon },
]

function navClass({ isActive }) {
  return [
    'flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium rounded-lg transition',
    isActive ? 'text-indigo-600' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white',
  ].join(' ')
}

function desktopNavClass({ isActive }) {
  return [
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition',
    isActive
      ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-white'
      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white',
  ].join(' ')
}

export default function NavBar() {
  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 px-2 py-1 md:hidden safe-area-inset-bottom">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={navClass}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-60 flex-col bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 px-4 py-6 z-40">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Habits</h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={desktopNavClass}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-100 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <LogOutIcon className="w-4 h-4" />
          Sign out
        </button>
      </aside>
    </>
  )
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function CalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function GridIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function RepeatIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

function LogOutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
