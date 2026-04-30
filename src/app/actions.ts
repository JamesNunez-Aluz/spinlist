'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) return { error: error.message }
  return { ok: true, message: 'Check your email to confirm your account.' }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function addTask(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const urgency = Number(formData.get('urgency') ?? 3)
  const importance = Number(formData.get('importance') ?? 3)

  if (!title) return { error: 'Title is required.' }
  if (urgency < 1 || urgency > 5 || importance < 1 || importance > 5) {
    return { error: 'Urgency and importance must be 1–5.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    urgency,
    importance,
  })

  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}

export async function completeTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}
