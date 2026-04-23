const oneDayMs = 86_400_000

export type WeightUnit = 'lb' | 'kg' | 'bodyweight'

export function formatWeight(weight: number | null, unit: WeightUnit): string {
  if (unit === 'bodyweight') return 'BW'
  if (weight == null) return '—'
  const rounded = Number.isInteger(weight) ? weight.toString() : weight.toFixed(1)
  return `${rounded} ${unit}`
}

export function formatSet(weight: number | null, reps: number | null, unit: WeightUnit): string {
  const w = formatWeight(weight, unit)
  const r = reps ?? '—'
  return unit === 'bodyweight' ? `${r} reps` : `${w} × ${r}`
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatRelativeDay(input: Date | string, now: Date = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input
  const startOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const diff = Math.round((startOf(now) - startOf(date)) / oneDayMs)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 0 && diff < 7) return `${diff}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function toDateOnly(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  return d.toISOString().slice(0, 10)
}
