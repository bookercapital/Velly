import Link from 'next/link'
import { ChevronRight, ListOrdered, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatRelativeDay } from '@/lib/format'
import { startSession } from './actions'

export const dynamic = 'force-dynamic'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86_400_000).toISOString()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at, ended_at, notes, sets(id)')
    .gte('started_at', fourteenDaysAgo)
    .order('started_at', { ascending: false })

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workouts</h1>
        <Link
          href="/workouts/exercises"
          className="flex size-10 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          aria-label="Exercise library"
        >
          <ListOrdered className="size-5" />
        </Link>
      </div>

      <form action={startSession}>
        <Button type="submit" className="h-14 w-full text-base">
          <Play className="size-5" /> Start workout
        </Button>
      </form>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-500">Last 14 days</h2>
        {sessions && sessions.length > 0 ? (
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/workouts/${s.id}`}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{formatRelativeDay(s.started_at)}</p>
                    <p className="text-xs text-neutral-500">
                      {s.sets.length} {s.sets.length === 1 ? 'set' : 'sets'}
                      {s.ended_at ? '' : ' · in progress'}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-neutral-400" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No workouts yet. Tap <span className="font-medium">Start workout</span> above.
          </div>
        )}
      </section>
    </div>
  )
}
