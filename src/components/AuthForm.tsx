'use client'

import { useState, useTransition } from 'react'

type Result = { error?: string; ok?: boolean; message?: string }

export default function AuthForm({
  action,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<Result | void>
  submitLabel: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
      else if (result?.message) setMessage(result.message)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/70 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl glass px-4 py-3 text-white outline-none focus:border-pink-400/60 transition"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="w-full rounded-xl glass px-4 py-3 text-white outline-none focus:border-pink-400/60 transition"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
      >
        {isPending ? 'Working…' : submitLabel}
      </button>
    </form>
  )
}
