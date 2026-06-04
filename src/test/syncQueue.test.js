import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'

vi.mock('../lib/offlineQueue', () => ({
  getAllQueued: vi.fn(),
  dequeue:     vi.fn().mockResolvedValue(undefined)
}))

import { getAllQueued, dequeue } from '../lib/offlineQueue'

describe('drainQueue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('drains upsert operations', async () => {
    getAllQueued.mockResolvedValue([
      { key: 1, type: 'upsert', payload: { id: 'abc', title: 'Hello' } }
    ])
    const { drainQueue } = await import('../lib/syncQueue')
    await drainQueue()
    expect(supabase.from).toHaveBeenCalledWith('notes')
    expect(dequeue).toHaveBeenCalledWith(1)
  })

  it('drains delete operations', async () => {
    getAllQueued.mockResolvedValue([
      { key: 2, type: 'delete', payload: { id: 'abc' } }
    ])
    const { drainQueue } = await import('../lib/syncQueue')
    await drainQueue()
    expect(dequeue).toHaveBeenCalledWith(2)
  })

  it('stops draining on error and leaves item in queue', async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ error: { message: 'Network error' } }),
      delete: vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [] })
    })
    getAllQueued.mockResolvedValue([
      { key: 3, type: 'upsert', payload: { id: 'xyz' } }
    ])
    const { drainQueue } = await import('../lib/syncQueue')
    await drainQueue()
    expect(dequeue).not.toHaveBeenCalled()
  })
})
