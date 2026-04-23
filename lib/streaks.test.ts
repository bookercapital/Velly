import { describe, expect, it } from 'vitest'
import {
  currentStreak,
  longestStreak,
  todayStatus,
  type DailyActivityRow,
} from './streaks'

function row(
  date: string,
  flags: Partial<Pick<DailyActivityRow, 'had_workout' | 'had_peptide' | 'had_reading'>> = {},
): DailyActivityRow {
  return {
    activity_date: date,
    had_workout: flags.had_workout ?? false,
    had_peptide: flags.had_peptide ?? false,
    had_reading: flags.had_reading ?? false,
  }
}

const today = new Date('2026-04-22T12:00:00Z')

describe('currentStreak', () => {
  it('is 0 when no activity', () => {
    expect(currentStreak([], 'any', today)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const rows = [
      row('2026-04-20', { had_workout: true }),
      row('2026-04-21', { had_workout: true }),
      row('2026-04-22', { had_workout: true }),
    ]
    expect(currentStreak(rows, 'any', today)).toBe(3)
  })

  it('preserves streak if today is not logged but yesterday is', () => {
    const rows = [
      row('2026-04-20', { had_workout: true }),
      row('2026-04-21', { had_workout: true }),
    ]
    expect(currentStreak(rows, 'any', today)).toBe(2)
  })

  it('resets when there is a gap', () => {
    const rows = [
      row('2026-04-18', { had_workout: true }),
      row('2026-04-19', { had_workout: true }),
      row('2026-04-22', { had_workout: true }),
    ]
    expect(currentStreak(rows, 'any', today)).toBe(1)
  })

  it('filters by domain', () => {
    const rows = [
      row('2026-04-19', { had_workout: true }),
      row('2026-04-21', { had_reading: true }),
      row('2026-04-22', { had_reading: true }),
    ]
    expect(currentStreak(rows, 'workout', today)).toBe(0)
    expect(currentStreak(rows, 'reading', today)).toBe(2)
    expect(currentStreak(rows, 'any', today)).toBe(2)
  })
})

describe('longestStreak', () => {
  it('finds the longest run', () => {
    const rows = [
      row('2026-04-10', { had_workout: true }),
      row('2026-04-11', { had_workout: true }),
      row('2026-04-12', { had_workout: true }),
      row('2026-04-13', { had_workout: true }),
      row('2026-04-15', { had_workout: true }),
      row('2026-04-16', { had_workout: true }),
    ]
    expect(longestStreak(rows, 'workout')).toBe(4)
  })

  it('is 0 for empty input', () => {
    expect(longestStreak([], 'any')).toBe(0)
  })
})

describe('todayStatus', () => {
  it('reflects flags for the current day', () => {
    const rows = [row('2026-04-22', { had_workout: true, had_reading: true })]
    expect(todayStatus(rows, today)).toEqual({
      workout: true,
      peptide: false,
      reading: true,
    })
  })

  it('returns all false when no row for today', () => {
    const rows = [row('2026-04-21', { had_workout: true })]
    expect(todayStatus(rows, today)).toEqual({
      workout: false,
      peptide: false,
      reading: false,
    })
  })
})
