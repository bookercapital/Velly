'use client'

import { addSet, deleteSet, type SetInput } from '@/app/(tabs)/workouts/actions'
import { registerHandler } from './sync'

registerHandler('addSet', async (payload) => {
  const result = await addSet(payload as SetInput)
  return result.ok ? { ok: true } : { ok: false, error: result.error }
})

registerHandler('deleteSet', async (payload) => {
  const { id, sessionId } = payload as { id: string; sessionId: string }
  const result = await deleteSet(id, sessionId)
  return result.ok ? { ok: true } : { ok: false, error: result.error }
})
