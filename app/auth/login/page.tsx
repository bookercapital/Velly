'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<
    { kind: 'idle' } | { kind: 'pending' } | { kind: 'confirm' } | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus({ kind: 'pending' })
    const supabase = createClient()

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setStatus({ kind: 'error', message: error.message })
        return
      }
      router.replace(next)
      router.refresh()
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }
    if (!data.session) {
      setStatus({ kind: 'confirm' })
      return
    }
    router.replace(next)
    router.refresh()
  }

  const busy = status.kind === 'pending'

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {mode === 'signin' ? 'Welcome back.' : 'One-time setup. Remembered across devices.'}
          </p>
        </div>

        {status.kind === 'confirm' ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4 text-sm">
            Account created. Check <span className="font-medium">{email}</span> to confirm, then sign in.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-3 text-base focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-100"
            />
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-3 text-base focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-100"
            />
            <button
              type="submit"
              disabled={busy}
              className="velly-gradient h-12 w-full rounded-md text-base font-semibold text-white shadow-md shadow-blue-500/25 disabled:opacity-50"
            >
              {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            {status.kind === 'error' ? (
              <p className="text-sm text-red-600">{status.message}</p>
            ) : null}
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setStatus({ kind: 'idle' })
          }}
          className="w-full text-center text-sm text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-400"
        >
          {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}
