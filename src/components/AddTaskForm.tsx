'use client'

import { useState, useTransition } from 'react'
import { addTask } from '@/app/actions'

const RATINGS = [1, 2, 3, 4, 5] as const

export default function AddTaskForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [urgency, setUrgency] = useState(3)
  const [importance, setImportance] = useState(3)

  function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('urgency', String(urgency))
    formData.set('importance', String(importance))
    startTransition(async () => {
      const result = await addTask(formData)
      if (result?.error) setError(result.error)
      else {
        const form = document.querySelector<HTMLFormElement>('#add-task-form')
        form?.reset()
        setUrgency(3)
        setImportance(3)
      }
    })
  }

  return (
    <form id="add-task-form" action={handleSubmit} className="space-y-4">
      <input
        name="title"
        required
        maxLength={200}
        placeholder="What needs doing?"
        className="w-full rounded-xl glass px-4 py-3 text-white outline-none focus:border-pink-400/60 transition"
      />

      <Rating label="Urgency" value={urgency} onChange={setUrgency} accent="from-amber-400 to-rose-500" />
      <Rating label="Importance" value={importance} onChange={setImportance} accent="from-cyan-400 to-violet-500" />

      {error && (
        <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60"
      >
        {isPending ? 'Adding…' : 'Add to wheel'}
      </button>
    </form>
  )
}

function Rating({
  label,
  value,
  onChange,
  accent,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  accent: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-sm font-medium text-white/90">{value}</span>
      </div>
      <div className="flex gap-1.5">
        {RATINGS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
            className={`flex-1 h-9 rounded-lg transition ${
              n <= value
                ? `bg-gradient-to-r ${accent}`
                : 'glass hover:bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
