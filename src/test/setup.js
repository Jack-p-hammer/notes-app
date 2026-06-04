import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession:        vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOtp:     vi.fn().mockResolvedValue({ error: null }),
      signOut:           vi.fn().mockResolvedValue({})
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [] }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis()
    }),
    channel:       vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }),
    removeChannel: vi.fn()
  }
}))

const mockIDBRequest = (result) => {
  const req = { result, error: null, onsuccess: null, onerror: null }
  setTimeout(() => req.onsuccess?.({ target: req }), 0)
  return req
}

global.indexedDB = {
  open: () => {
    const req = { result: null, error: null, onupgradeneeded: null, onsuccess: null, onerror: null }
    const store = {
      add:        vi.fn(() => mockIDBRequest(1)),
      delete:     vi.fn(() => mockIDBRequest(undefined)),
      openCursor: vi.fn(() => mockIDBRequest(null))
    }
    const db = {
      createObjectStore: vi.fn(() => store),
      transaction: vi.fn(() => ({ objectStore: vi.fn(() => store) }))
    }
    setTimeout(() => {
      req.result = db
      req.onsuccess?.({ target: req })
    }, 0)
    return req
  }
}
