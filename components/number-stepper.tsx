'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  value: number | null
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  label?: string
  suffix?: string
  className?: string
}

export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  label,
  suffix,
  className,
}: Props) {
  const current = value ?? 0
  const canDec = current - step >= min
  const canInc = max == null || current + step <= max

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label ? <span className="text-sm text-neutral-500">{label}</span> : null}
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label ?? 'value'}`}
          disabled={!canDec}
          onClick={() => onChange(current - step)}
          className="flex size-12 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200"
        >
          <Minus className="size-5" />
        </button>
        <div className="flex flex-1 items-center justify-center rounded-md border border-neutral-300 px-4 text-2xl font-semibold tabular-nums dark:border-neutral-700">
          {value ?? '—'}
          {suffix ? <span className="ml-1 text-sm font-normal text-neutral-500">{suffix}</span> : null}
        </div>
        <button
          type="button"
          aria-label={`Increase ${label ?? 'value'}`}
          disabled={!canInc}
          onClick={() => onChange(current + step)}
          className="flex size-12 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  )
}
