'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Flag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NumberStepper } from '@/components/number-stepper'
import { formatSet, type WeightUnit } from '@/lib/format'
import { runOrQueue } from '@/lib/offline/sync'
import { addSet, deleteSet, endSession, type SetInput } from '../actions'

type Session = {
  id: string
  started_at: string
  ended_at: string | null
  notes: string | null
}

type Exercise = {
  id: string
  name: string
  category: string | null
  default_unit: string
}

type LoggedSet = {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  weight: number | null
  reps: number | null
  is_warmup: boolean
  performed_at: string
}

export function SessionView({
  session,
  initialSets,
  exercises,
}: {
  session: Session
  initialSets: LoggedSet[]
  exercises: Exercise[]
}) {
  const router = useRouter()
  const [sets, setSets] = useState<LoggedSet[]>(initialSets)
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    initialSets.length > 0 ? initialSets[initialSets.length - 1].exercise_id : null,
  )
  const [pickerOpen, setPickerOpen] = useState(currentExerciseId == null)

  const currentExercise = exercises.find((e) => e.id === currentExerciseId) ?? null
  const unit = (currentExercise?.default_unit ?? 'lb') as WeightUnit

  const lastSetForExercise = useMemo(() => {
    if (!currentExerciseId) return null
    const forEx = sets.filter((s) => s.exercise_id === currentExerciseId)
    return forEx[forEx.length - 1] ?? null
  }, [sets, currentExerciseId])

  const [weight, setWeight] = useState<number | null>(null)
  const [reps, setReps] = useState<number | null>(null)

  const initWeight = lastSetForExercise?.weight ?? (unit === 'bodyweight' ? null : 0)
  const initReps = lastSetForExercise?.reps ?? 0
  const effectiveWeight = weight ?? initWeight
  const effectiveReps = reps ?? initReps

  const setsByExercise = useMemo(() => {
    const map = new Map<string, LoggedSet[]>()
    for (const s of sets) {
      const arr = map.get(s.exercise_id) ?? []
      arr.push(s)
      map.set(s.exercise_id, arr)
    }
    return map
  }, [sets])

  const pickExercise = (id: string) => {
    setCurrentExerciseId(id)
    setPickerOpen(false)
    setWeight(null)
    setReps(null)
  }

  const onAddSet = async () => {
    if (!currentExercise) return
    const setNumber = (setsByExercise.get(currentExercise.id)?.length ?? 0) + 1
    const input: SetInput = {
      id: crypto.randomUUID(),
      session_id: session.id,
      exercise_id: currentExercise.id,
      set_number: setNumber,
      weight: unit === 'bodyweight' ? null : effectiveWeight,
      reps: effectiveReps,
      is_warmup: false,
    }

    const optimistic: LoggedSet = {
      ...input,
      performed_at: new Date().toISOString(),
    }
    setSets((prev) => [...prev, optimistic])

    const result = await runOrQueue('addSet', input, () => addSet(input))
    if (!result.ok && !result.queued) {
      setSets((prev) => prev.filter((s) => s.id !== input.id))
      toast.error(result.error)
    }
  }

  const onRepeatLast = () => {
    if (!lastSetForExercise) return
    setWeight(lastSetForExercise.weight)
    setReps(lastSetForExercise.reps)
  }

  const onDeleteSet = async (id: string) => {
    const prev = sets
    setSets((p) => p.filter((s) => s.id !== id))
    const result = await runOrQueue('deleteSet', { id, sessionId: session.id }, () =>
      deleteSet(id, session.id),
    )
    if (!result.ok && !result.queued) {
      setSets(prev)
      toast.error(result.error)
    }
  }

  const [finishing, startFinish] = useTransition()
  const onFinish = () => {
    startFinish(async () => {
      const result = await endSession(session.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Workout saved')
      router.push('/workouts')
    })
  }

  if (pickerOpen) {
    return (
      <ExercisePicker
        exercises={exercises}
        onPick={pickExercise}
        onClose={currentExerciseId ? () => setPickerOpen(false) : undefined}
      />
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Logging</p>
          <h1 className="text-2xl font-semibold">{currentExercise?.name}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
          Change
        </Button>
      </div>

      <div className="space-y-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
        {unit === 'bodyweight' ? null : (
          <NumberStepper
            label={`Weight (${unit})`}
            value={effectiveWeight}
            onChange={setWeight}
            step={5}
            min={0}
          />
        )}
        <NumberStepper label="Reps" value={effectiveReps} onChange={setReps} step={1} min={0} />
        <div className="flex gap-2">
          {lastSetForExercise ? (
            <Button type="button" variant="outline" onClick={onRepeatLast} className="flex-1">
              <Copy className="size-4" /> Repeat last
            </Button>
          ) : null}
          <Button type="button" onClick={onAddSet} className="flex-1 h-12 text-base">
            Add set
          </Button>
        </div>
      </div>

      {sets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-500">This session</h2>
          {[...setsByExercise.entries()].map(([exerciseId, exSets]) => {
            const ex = exercises.find((e) => e.id === exerciseId)
            if (!ex) return null
            const exUnit = ex.default_unit as WeightUnit
            return (
              <div
                key={exerciseId}
                className="rounded-md border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
                  <p className="font-medium">{ex.name}</p>
                  <p className="text-xs text-neutral-500">
                    {exSets.length} {exSets.length === 1 ? 'set' : 'sets'}
                  </p>
                </div>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {exSets.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="w-6 text-neutral-400">{s.set_number}.</span>
                      <span className="flex-1 tabular-nums">{formatSet(s.weight, s.reps, exUnit)}</span>
                      <button
                        type="button"
                        onClick={() => onDeleteSet(s.id)}
                        aria-label="Delete set"
                        className="flex size-8 items-center justify-center rounded-md text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      ) : null}

      <Separator />

      <Button
        type="button"
        onClick={onFinish}
        disabled={finishing}
        className="h-14 w-full text-base"
        variant={session.ended_at ? 'outline' : 'default'}
      >
        <Flag className="size-5" />
        {session.ended_at ? 'Already ended' : finishing ? 'Finishing…' : 'Finish workout'}
      </Button>
    </div>
  )
}

function ExercisePicker({
  exercises,
  onPick,
  onClose,
}: {
  exercises: Exercise[]
  onPick: (id: string) => void
  onClose?: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pick exercise</h1>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-md text-neutral-500"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <input
        type="search"
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 w-full rounded-md border border-neutral-300 px-3 text-base dark:border-neutral-700"
        autoFocus
      />

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No exercises match.{' '}
          <a href="/workouts/exercises" className="underline">
            Add one
          </a>
          .
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onPick(e.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-neutral-500">
                    {e.category ?? 'other'} · {e.default_unit}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
