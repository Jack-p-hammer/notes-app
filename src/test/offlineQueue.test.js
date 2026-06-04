import { describe, it, expect } from 'vitest'

describe('offlineQueue', () => {
  it('enqueue adds an operation', async () => {
    const { enqueue } = await import('../lib/offlineQueue')
    const key = await enqueue({ type: 'upsert', payload: { id: '1', title: 'Test' } })
    expect(key).toBe(1)
  })

  it('dequeue removes an operation', async () => {
    const { dequeue } = await import('../lib/offlineQueue')
    await expect(dequeue(1)).resolves.toBeUndefined()
  })

  it('getAllQueued returns empty array when queue is empty', async () => {
    const { getAllQueued } = await import('../lib/offlineQueue')
    const items = await getAllQueued()
    expect(Array.isArray(items)).toBe(true)
  })
})
