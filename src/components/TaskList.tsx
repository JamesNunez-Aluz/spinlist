'use client'

import { useTransition } from 'react'
import { completeTask, deleteTask } from '@/app/actions'
import type { Task } from '@/app/page'

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-white/50 text-sm py-6 text-center">
        No tasks yet. Add one to start spinning.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </ul>
  )
}

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  const weight = task.urgency * task.importance

  return (
    <li className="glass rounded-xl px-4 py-3 flex items-center gap-3 group">
      <div className="flex-1 min-w-0">
        <p className="text-white/95 truncate">{task.title}</p>
        <p className="text-xs text-white/45 mt-0.5">
          urgency {task.urgency} × importance {task.importance} ={' '}
          <span className="text-white/70">{weight}</span>
        </p>
      </div>
      <button
        title="Mark done"
        disabled={isPending}
        onClick={() => startTransition(() => completeTask(task.id).then(() => {}))}
        className="opacity-50 group-hover:opacity-100 hover:text-emerald-400 transition px-2"
        aria-label="Mark done"
      >
        ✓
      </button>
      <button
        title="Delete"
        disabled={isPending}
        onClick={() => startTransition(() => deleteTask(task.id).then(() => {}))}
        className="opacity-50 group-hover:opacity-100 hover:text-red-400 transition px-2"
        aria-label="Delete"
      >
        ✕
      </button>
    </li>
  )
}
