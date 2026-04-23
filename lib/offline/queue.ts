'use client'

const DB_NAME = 'velly'
const DB_VERSION = 1
const STORE = 'mutations'

export type QueuedMutation = {
  id: string
  kind: string
  payload: unknown
  createdAt: number
  attempts: number
  lastError?: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode)
        const store = transaction.objectStore(STORE)
        const request = fn(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
  )
}

export async function enqueue(kind: string, payload: unknown): Promise<QueuedMutation> {
  const mutation: QueuedMutation = {
    id: crypto.randomUUID(),
    kind,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  }
  await tx('readwrite', (store) => store.add(mutation))
  return mutation
}

export async function list(): Promise<QueuedMutation[]> {
  return tx('readonly', (store) => store.getAll() as IDBRequest<QueuedMutation[]>)
}

export async function remove(id: string): Promise<void> {
  await tx('readwrite', (store) => store.delete(id))
}

export async function markAttempt(id: string, error?: string): Promise<void> {
  const existing = await tx('readonly', (store) => store.get(id) as IDBRequest<QueuedMutation | undefined>)
  if (!existing) return
  const updated: QueuedMutation = {
    ...existing,
    attempts: existing.attempts + 1,
    lastError: error,
  }
  await tx('readwrite', (store) => store.put(updated))
}
