import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions'
import AddTaskForm from '@/components/AddTaskForm'
import TaskList from '@/components/TaskList'
import SpinWheel from '@/components/SpinWheel'

export type Task = {
  id: string
  title: string
  urgency: number
  importance: number
  created_at: string
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, urgency, importance, created_at')
    .is('completed_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen px-4 sm:px-8 py-4 sm:py-6">
      <header className="max-w-[1500px] mx-auto flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl sm:text-5xl font-bold bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
          SpinList
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-white/50">{user?.email}</span>
          <form action={signOut}>
            <button className="rounded-full glass px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto grid lg:grid-cols-[340px_1fr] gap-8 items-start">
        <section className="space-y-6">
          <div className="glass-strong rounded-3xl p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Add a task</h2>
            <AddTaskForm />
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Your tasks</h2>
              <span className="text-xs text-white/50">{tasks?.length ?? 0} active</span>
            </div>
            <div className="max-h-[40vh] lg:max-h-[calc(100vh-660px)] overflow-y-auto -mr-2 pr-2">
              <TaskList tasks={tasks ?? []} />
            </div>
          </div>
        </section>

        <section className="glass-strong rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center">
          <SpinWheel tasks={tasks ?? []} />
        </section>
      </main>
    </div>
  )
}
