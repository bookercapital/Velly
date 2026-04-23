export type Domain = 'workout' | 'peptide' | 'reading'

export type DailyActivityRow = {
  activity_date: string
  had_workout: boolean | null
  had_peptide: boolean | null
  had_reading: boolean | null
}

export type StreakFilter = Domain | 'any'

const oneDayMs = 86_400_000

export function dayKey(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10)
}

function hasDomain(row: DailyActivityRow, filter: StreakFilter): boolean {
  if (filter === 'any') {
    return !!(row.had_workout || row.had_peptide || row.had_reading)
  }
  if (filter === 'workout') return !!row.had_workout
  if (filter === 'peptide') return !!row.had_peptide
  return !!row.had_reading
}

export function activeDays(rows: DailyActivityRow[], filter: StreakFilter = 'any'): Set<string> {
  const set = new Set<string>()
  for (const row of rows) {
    if (hasDomain(row, filter)) set.add(dayKey(row.activity_date))
  }
  return set
}

export function currentStreak(
  rows: DailyActivityRow[],
  filter: StreakFilter = 'any',
  today: Date = new Date(),
): number {
  const days = activeDays(rows, filter)
  const todayKey = dayKey(today)
  const yesterdayKey = dayKey(new Date(today.getTime() - oneDayMs))
  let cursor: Date
  if (days.has(todayKey)) cursor = new Date(today)
  else if (days.has(yesterdayKey)) cursor = new Date(today.getTime() - oneDayMs)
  else return 0

  let count = 0
  while (days.has(dayKey(cursor))) {
    count += 1
    cursor = new Date(cursor.getTime() - oneDayMs)
  }
  return count
}

export function longestStreak(rows: DailyActivityRow[], filter: StreakFilter = 'any'): number {
  const days = [...activeDays(rows, filter)].sort()
  if (days.length === 0) return 0

  let best = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime()
    const curr = new Date(days[i]).getTime()
    if (curr - prev === oneDayMs) {
      run += 1
      if (run > best) best = run
    } else {
      run = 1
    }
  }
  return best
}

export function todayStatus(
  rows: DailyActivityRow[],
  today: Date = new Date(),
): { workout: boolean; peptide: boolean; reading: boolean } {
  const key = dayKey(today)
  const row = rows.find((r) => dayKey(r.activity_date) === key)
  return {
    workout: !!row?.had_workout,
    peptide: !!row?.had_peptide,
    reading: !!row?.had_reading,
  }
}
