import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [isNew, setIsNew]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // First try sign-in only (no account creation)
    const { error: signInErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin,
      },
    })

    if (!signInErr) {
      // Existing user
      setIsNew(false)
      setSent(true)
    } else if (signInErr.message?.toLowerCase().includes('rate limit')) {
      // Rate limited — don't send a second request
      setError('Too many emails sent. Please wait a few minutes and try again.')
    } else if (signInErr.message?.toLowerCase().includes('not found') || signInErr.message?.toLowerCase().includes('not registered')) {
      // New user — create account and send link
      const { error: signUpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      })
      if (signUpErr) setError(signUpErr.message)
      else { setIsNew(true); setSent(true) }
    } else {
      setError(signInErr.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Habits</h1>
          <p className="mt-2 text-sm text-gray-500">Your daily tracker</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center">
            <p className="text-sm font-medium text-indigo-800">
              {isNew ? 'Welcome! Account created.' : 'Welcome back!'}
            </p>
            <p className="mt-1 text-sm text-indigo-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setError(null) }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-600 underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
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
        )}
      </div>
    </div>
  )
}
