'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { flush } from '@/lib/offline/sync'
import '@/lib/offline/handlers'

export function OfflineSyncProvider() {
  useEffect(() => {
    async function tryFlush() {
      try {
        const { succeeded } = await flush()
        if (succeeded > 0) {
          toast.success(`${succeeded} pending ${succeeded === 1 ? 'change' : 'changes'} synced`)
        }
      } catch {
        // Silent — flush failures are recorded on the queue entries themselves.
      }
    }

    if (navigator.onLine) tryFlush()
    window.addEventListener('online', tryFlush)
    return () => window.removeEventListener('online', tryFlush)
  }, [])

  return null
}
