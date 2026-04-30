import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep]         = useState('email') // 'email' | 'password'
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: fnErr } = await supabase.functions.invoke('check-email', {
      body: { email },
    })

    if (fnErr) {
      setError('Could not verify email. Please try again.')
      setLoading(false)
      return
    }

    if (!data?.exists) {
      setError('No account found for that email address.')
      setLoading(false)
      return
    }

    setStep('password')
    setLoading(false)
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })

    if (signInErr) {
      setError('Incorrect password. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[#fafafa] dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Habits</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Your daily tracker</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Email</label>
              <div className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-4 py-3">
                <span className="text-sm text-gray-700 dark:text-zinc-300">{email}</span>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setPassword(''); setError(null) }}
                  className="text-xs text-indigo-500 hover:text-indigo-700 underline ml-3"
                >
                  Change
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
