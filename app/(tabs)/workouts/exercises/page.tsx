import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ExerciseLibrary } from './exercise-library'

export const dynamic = 'force-dynamic'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, default_unit, notes, archived, created_at')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/workouts"
          className="flex size-10 items-center justify-center rounded-md text-neutral-600 dark:text-neutral-300"
          aria-label="Back to workouts"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Exercise library</h1>
      </div>
      <ExerciseLibrary exercises={exercises ?? []} />
    </div>
  )
}
