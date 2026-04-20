import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Today from './pages/Today'
import Weekly from './pages/Weekly'
import Monthly from './pages/Monthly'
import Yearly from './pages/Yearly'
import NavBar from './components/layout/NavBar'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

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

  if (!session) {
    return <Auth />
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col h-full md:flex-row">
        <NavBar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pl-60">
          <Routes>
            <Route path="/"        element={<Today />} />
            <Route path="/weekly"  element={<Weekly />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/yearly"  element={<Yearly />} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
