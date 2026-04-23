'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus({ kind: 'sending' })
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }
    setStatus({ kind: 'sent' })
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-neutral-500">
            Enter your email and we&apos;ll send you a magic link.
          </p>
        </div>

        {status.kind === 'sent' ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-4 text-sm">
            Check <span className="font-medium">{email}</span> for a magic link.
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
              className="w-full rounded-md border border-neutral-300 px-3 py-3 text-base focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:focus:border-neutral-100"
            />
            <button
              type="submit"
              disabled={status.kind === 'sending'}
              className="h-12 w-full rounded-md bg-neutral-900 text-base font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {status.kind === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {status.kind === 'error' ? (
              <p className="text-sm text-red-600">{status.message}</p>
            ) : null}
          </form>
        )}
      </div>
    </main>
  )
}
