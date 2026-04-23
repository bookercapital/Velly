'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UNITS } from './constants'

export type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string }

type ExerciseInput = {
  name: string
  category: string | null
  default_unit: (typeof UNITS)[number]
  notes: string | null
}

function normalizeExerciseInput(raw: FormData): ExerciseInput | { error: string } {
  const name = (raw.get('name') ?? '').toString().trim()
  if (!name) return { error: 'Name is required' }
  if (name.length > 80) return { error: 'Name is too long (80 chars max)' }

  const categoryRaw = (raw.get('category') ?? '').toString().trim()
  const category = categoryRaw && categoryRaw !== 'other' ? categoryRaw : null

  const unitRaw = (raw.get('default_unit') ?? 'lb').toString()
  if (!UNITS.includes(unitRaw as (typeof UNITS)[number])) return { error: 'Invalid unit' }

  const notesRaw = (raw.get('notes') ?? '').toString().trim()
  return {
    name,
    category,
    default_unit: unitRaw as (typeof UNITS)[number],
    notes: notesRaw || null,
  }
}

export async function createExercise(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const input = normalizeExerciseInput(formData)
  if ('error' in input) return { ok: false, error: input.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...input, user_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  revalidatePath('/workouts/exercises')
  return { ok: true, data: { id: data.id } }
}

export async function archiveExercise(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('exercises').update({ archived: true }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/workouts/exercises')
  return { ok: true, data: undefined }
}

export async function restoreExercise(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('exercises').update({ archived: false }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/workouts/exercises')
  return { ok: true, data: undefined }
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function startSession(): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to start session')

  revalidatePath('/workouts')
  redirect(`/workouts/${data.id}`)
}

export async function endSession(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('workout_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/workouts')
  revalidatePath(`/workouts/${id}`)
  return { ok: true, data: undefined }
}

export async function deleteSession(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/workouts')
  return { ok: true, data: undefined }
}

// ============================================================================
// SETS
// ============================================================================

export type SetInput = {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  weight: number | null
  reps: number | null
  is_warmup: boolean
}

export async function addSet(input: SetInput): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('sets')
    .upsert({ ...input, user_id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/workouts/${input.session_id}`)
  return { ok: true, data: { id: input.id } }
}

export async function deleteSet(id: string, sessionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/workouts/${sessionId}`)
  return { ok: true, data: undefined }
}

