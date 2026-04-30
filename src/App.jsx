import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'
import Auth from './pages/Auth'
import Today from './pages/Today'
import Weekly from './pages/Weekly'
import Monthly from './pages/Monthly'
import Yearly from './pages/Yearly'
import Ideas from './pages/Ideas'
import Projects from './pages/Projects'
import Habits from './pages/Habits'
import NavBar from './components/layout/NavBar'

function SwipeDots({ current, total }) {
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 md:hidden">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full transition-all duration-300 ${
            i === current
              ? 'w-4 h-1.5 bg-indigo-600'
              : 'w-1.5 h-1.5 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function AppLayout() {
  const { onTouchStart, onTouchEnd, currentIndex, total } = useSwipeNavigation()

  return (
    <div className="flex flex-col h-full md:flex-row">
      <NavBar />
      {currentIndex !== -1 && (
        <SwipeDots current={currentIndex} total={total} />
      )}
      <main
        className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pl-60"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Routes>
          <Route path="/"         element={<Today />} />
          <Route path="/weekly"   element={<Weekly />} />
          <Route path="/monthly"  element={<Monthly />} />
          <Route path="/yearly"   element={<Yearly />} />
          <Route path="/habits"   element={<Habits />} />
          <Route path="/ideas"    element={<Ideas />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
