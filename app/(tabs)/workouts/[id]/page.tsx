import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionView } from './session-view'

export const dynamic = 'force-dynamic'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [sessionRes, setsRes, exercisesRes] = await Promise.all([
    supabase.from('workout_sessions').select('id, started_at, ended_at, notes').eq('id', id).single(),
    supabase
      .from('sets')
      .select('id, session_id, exercise_id, set_number, weight, reps, is_warmup, performed_at')
      .eq('session_id', id)
      .order('performed_at', { ascending: true }),
    supabase
      .from('exercises')
      .select('id, name, category, default_unit')
      .eq('archived', false)
      .order('name', { ascending: true }),
  ])

  if (sessionRes.error || !sessionRes.data) notFound()

  return (
    <SessionView
      session={sessionRes.data}
      initialSets={setsRes.data ?? []}
      exercises={exercisesRes.data ?? []}
    />
  )
}
