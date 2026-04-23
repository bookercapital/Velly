'use client'

import { enqueue, list, markAttempt, remove, type QueuedMutation } from './queue'

type Handler = (payload: unknown) => Promise<{ ok: boolean; error?: string }>

const handlers = new Map<string, Handler>()

export function registerHandler(kind: string, handler: Handler) {
  handlers.set(kind, handler)
}

export async function runOrQueue<T>(
  kind: string,
  payload: unknown,
  attempt: () => Promise<{ ok: true; data?: T } | { ok: false; error: string }>,
): Promise<{ ok: true; data?: T } | { ok: false; error: string; queued: boolean }> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    await enqueue(kind, payload)
    return { ok: false, error: 'offline', queued: true }
  }
  try {
    const result = await attempt()
    if (result.ok) return result
    await enqueue(kind, payload)
    return { ...result, queued: true }
  } catch (err) {
    await enqueue(kind, payload)
    return { ok: false, error: (err as Error).message, queued: true }
  }
}

export async function flush(): Promise<{ succeeded: number; failed: number; pending: number }> {
  const pending = await list()
  let succeeded = 0
  let failed = 0

  for (const mutation of pending) {
    const handler = handlers.get(mutation.kind)
    if (!handler) {
      failed += 1
      continue
    }
    try {
      const result = await handler(mutation.payload)
      if (result.ok) {
        await remove(mutation.id)
        succeeded += 1
      } else {
        await markAttempt(mutation.id, result.error)
        failed += 1
      }
    } catch (err) {
      await markAttempt(mutation.id, (err as Error).message)
      failed += 1
    }
  }

  return { succeeded, failed, pending: pending.length }
}

export type { QueuedMutation }
