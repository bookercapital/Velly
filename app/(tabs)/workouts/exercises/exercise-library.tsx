'use client'

import { useState, useTransition } from 'react'
import { Archive, Plus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { archiveExercise, createExercise, restoreExercise } from '../actions'
import { CATEGORIES, UNITS } from '../constants'

type Exercise = {
  id: string
  name: string
  category: string | null
  default_unit: string
  notes: string | null
  archived: boolean
  created_at: string
}

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [showArchived, setShowArchived] = useState(false)
  const [adding, setAdding] = useState(false)

  const active = exercises.filter((e) => !e.archived)
  const archived = exercises.filter((e) => e.archived)

  return (
    <div className="space-y-6">
      {adding ? (
        <AddExerciseForm onClose={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)} className="h-12 w-full text-base">
          <Plus className="size-4" /> Add exercise
        </Button>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-500">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyState message="No exercises yet. Add your first one above." />
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {active.map((e) => (
              <ExerciseRow key={e.id} exercise={e} />
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 ? (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            className="text-sm font-medium text-neutral-500 underline-offset-2 hover:underline"
          >
            {showArchived ? 'Hide' : 'Show'} archived ({archived.length})
          </button>
          {showArchived ? (
            <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {archived.map((e) => (
                <ExerciseRow key={e.id} exercise={e} />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const [pending, startTransition] = useTransition()

  const onArchive = () => {
    startTransition(async () => {
      const result = await archiveExercise(exercise.id)
      if (!result.ok) toast.error(result.error)
    })
  }

  const onRestore = () => {
    startTransition(async () => {
      const result = await restoreExercise(exercise.id)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <li className={cn('flex items-center gap-3 p-3', pending && 'opacity-50')}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{exercise.name}</p>
        <p className="text-xs text-neutral-500">
          {exercise.category ?? 'other'} · {exercise.default_unit}
        </p>
      </div>
      {exercise.archived ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRestore}
          disabled={pending}
          aria-label={`Restore ${exercise.name}`}
        >
          <RotateCcw className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onArchive}
          disabled={pending}
          aria-label={`Archive ${exercise.name}`}
        >
          <Archive className="size-4" />
        </Button>
      )}
    </li>
  )
}

function AddExerciseForm({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const result = await createExercise(data)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Exercise added')
      form.reset()
      onClose()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoFocus placeholder="Bench press" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue="other"
            className="h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="default_unit">Unit</Label>
          <select
            id="default_unit"
            name="default_unit"
            defaultValue="lb"
            className="h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 text-sm dark:border-neutral-700"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" placeholder="Grip, bar type, cues…" />
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? 'Adding…' : 'Add'}
        </Button>
      </div>
    </form>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
      {message}
    </div>
  )
}
