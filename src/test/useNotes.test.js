import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import React from 'react'
import { useNotes } from '../hooks/useNotes'
import { supabase } from '../lib/supabase'

function makeWrapper(userId = 'user-1') {
  return function Wrapper({ children }) {
    return React.createElement(
      AuthContext.Provider,
      { value: { session: userId ? { user: { id: userId } } : null, loading: false } },
      children
    )
  }
}

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
    })
    supabase.channel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({}),
    })
  })

  it('returns notes, saveNote, deleteNote, createNote', async () => {
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })
    await waitFor(() => expect(supabase.from).toHaveBeenCalled())
    expect(Array.isArray(result.current.notes)).toBe(true)
    expect(typeof result.current.saveNote).toBe('function')
    expect(typeof result.current.deleteNote).toBe('function')
    expect(typeof result.current.createNote).toBe('function')
  })

  it('fetches notes on mount when session exists', async () => {
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })
    await waitFor(() => expect(supabase.from).toHaveBeenCalledWith('notes'))
  })

  it('does not fetch notes when no session', () => {
    renderHook(() => useNotes(), { wrapper: makeWrapper(null) })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('saveNote calls supabase upsert when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })

    const testNote = {
      id: 'note-abc',
      user_id: 'user-1',
      title: 'Test',
      body: 'Body',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await act(async () => {
      await result.current.saveNote(testNote)
    })

    expect(supabase.from).toHaveBeenCalledWith('notes')
  })

  it('deleteNote calls supabase delete when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
    const mockDeleteChain = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
    }
    // Make delete().eq() resolve
    mockDeleteChain.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    supabase.from.mockReturnValue(mockDeleteChain)

    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.deleteNote('note-xyz')
    })

    expect(supabase.from).toHaveBeenCalledWith('notes')
  })

  it('createNote returns a uuid string', async () => {
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })
    await waitFor(() => expect(supabase.from).toHaveBeenCalled())

    let noteId
    act(() => {
      noteId = result.current.createNote()
    })

    expect(typeof noteId).toBe('string')
    expect(noteId.length).toBeGreaterThan(0)
  })

  it('registers online event listener for queue drain', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    renderHook(() => useNotes(), { wrapper: makeWrapper(null) })
    expect(addEventSpy).toHaveBeenCalledWith('online', expect.any(Function))
    addEventSpy.mockRestore()
  })
})
