import Link from 'next/link'
import { BookOpen, CheckCircle2, ChevronRight, Circle, Dumbbell, Flame, Plus, Syringe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { currentStreak, longestStreak, todayStatus, type DailyActivityRow } from '@/lib/streaks'
import { formatRelativeDay } from '@/lib/format'
import { startSession } from '../workouts/actions'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

const oneDayMs = 86_400_000

export default async function DashboardPage() {
  const supabase = await createClient()
  const sinceDate = new Date(Date.now() - 365 * oneDayMs).toISOString().slice(0, 10)

  const [activityRes, lastSessionRes] = await Promise.all([
    supabase
      .from('daily_activity')
      .select('activity_date, had_workout, had_peptide, had_reading')
      .gte('activity_date', sinceDate)
      .order('activity_date', { ascending: false }),
    supabase
      .from('workout_sessions')
      .select('id, started_at, ended_at, notes, sets(id, exercise_id, weight, reps, set_number, exercises(name, default_unit))')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const rows: DailyActivityRow[] = (activityRes.data ?? [])
    .filter((r): r is { activity_date: string; had_workout: boolean | null; had_peptide: boolean | null; had_reading: boolean | null } => r.activity_date != null)

  const streak = currentStreak(rows, 'any')
  const longest = longestStreak(rows, 'any')
  const today = todayStatus(rows)

  const lastSession = lastSessionRes.data

  return (
    <div className="space-y-5 pb-32">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Today</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <StreakTile streak={streak} longest={longest} />
      <TodayTasksTile today={today} />
      <QuickStart />
      <LastWorkoutCard session={lastSession} />
    </div>
  )
}

function StreakTile({ streak, longest }: { streak: number; longest: number }) {
  return (
    <div className="velly-glass rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
          <Flame className="size-7" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Current streak</p>
          <p className="text-3xl font-bold tabular-nums">
            {streak} <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">{streak === 1 ? 'day' : 'days'}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Longest</p>
          <p className="text-lg font-bold tabular-nums">{longest}</p>
        </div>
      </div>
    </div>
  )
}

function TodayTasksTile({ today }: { today: { workout: boolean; peptide: boolean; reading: boolean } }) {
  const items = [
    { key: 'workout', label: 'Complete a workout', icon: Dumbbell, done: today.workout, href: '/workouts' },
    { key: 'peptide', label: 'Log a peptide', icon: Syringe, done: today.peptide, href: '/peptides' },
    { key: 'reading', label: 'Log reading', icon: BookOpen, done: today.reading, href: '/reading' },
  ] as const
  const doneCount = items.filter((i) => i.done).length

  return (
    <div className="velly-glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Today&apos;s Tasks</h2>
        <span className="velly-gradient rounded-full px-3 py-1 text-xs font-semibold text-white">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map(({ key, label, icon: Icon, done, href }) => (
          <li key={key}>
            <Link
              href={href}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 transition-colors',
                'hover:bg-black/5 dark:hover:bg-white/5',
              )}
            >
              {done ? (
                <CheckCircle2 className="size-5 shrink-0 text-[color:var(--velly-success)]" />
              ) : (
                <Circle className="size-5 shrink-0 text-neutral-400" />
              )}
              <Icon className={cn('size-4 shrink-0', done ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400')} />
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  done ? 'text-neutral-400 line-through dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-100',
                )}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuickStart() {
  return (
    <form action={startSession}>
      <button
        type="submit"
        className="velly-gradient flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform active:scale-[0.98]"
      >
        <Plus className="size-5" /> Start workout
      </button>
    </form>
  )
}

type LastSession = {
  id: string
  started_at: string
  ended_at: string | null
  notes: string | null
  sets: Array<{
    id: string
    exercise_id: string
    weight: number | null
    reps: number | null
    set_number: number
    exercises: { name: string; default_unit: string } | null
  }>
}

function LastWorkoutCard({ session }: { session: LastSession | null }) {
  if (!session) {
    return (
      <div className="velly-glass rounded-2xl p-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No workouts logged yet.
      </div>
    )
  }

  const exerciseIds = new Set<string>()
  let setCount = 0
  let volume = 0
  for (const s of session.sets) {
    if (s.exercise_id) exerciseIds.add(s.exercise_id)
    setCount += 1
    if (s.weight != null && s.reps != null) volume += s.weight * s.reps
  }

  const title = session.notes?.trim() || formatRelativeDay(session.started_at)
  const volumeLabel = volume > 0 ? `${Math.round(volume).toLocaleString()} lbs` : null

  return (
    <Link
      href={`/workouts/${session.id}`}
      className="velly-glass flex items-center gap-4 rounded-2xl p-5 transition-transform active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Last workout</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatRelativeDay(session.started_at)}</p>
        </div>
        <p className="mt-1 truncate text-base font-bold">{title}</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {exerciseIds.size} {exerciseIds.size === 1 ? 'exercise' : 'exercises'} · {setCount} {setCount === 1 ? 'set' : 'sets'}
          {volumeLabel ? ` · ${volumeLabel}` : ''}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-neutral-400" />
    </Link>
  )
}
