import { useEffect, useReducer, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { enqueue } from '../lib/offlineQueue'
import { drainQueue } from '../lib/syncQueue'
import { useAuth } from '../context/AuthContext'

const NOTES_TABLE = 'notes'

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return action.notes
    case 'UPSERT': {
      const exists = state.find((n) => n.id === action.note.id)
      return exists
        ? state.map((n) => (n.id === action.note.id ? action.note : n))
        : [action.note, ...state]
    }
    case 'DELETE':
      return state.filter((n) => n.id !== action.id)
    default:
      return state
  }
}

export function useNotes() {
  const { session } = useAuth()
  const [notes, dispatch] = useReducer(reducer, [])
  const userId = session?.user?.id
  const channelRef = useRef(null)

  useEffect(() => {
    const handler = () => drainQueue()
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [])

  useEffect(() => {
    if (!userId) return
    supabase
      .from(NOTES_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch notes:', error.message)
          return
        }
        if (data) dispatch({ type: 'SET', notes: data })
      })
  }, [userId])

  useEffect(() => {
    if (!userId) return

    channelRef.current = supabase
      .channel(`notes:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: NOTES_TABLE,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            dispatch({ type: 'DELETE', id: payload.old.id })
          } else {
            dispatch({ type: 'UPSERT', note: payload.new })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelRef.current)
    }
  }, [userId])

  const saveNote = useCallback(async (note) => {
    dispatch({ type: 'UPSERT', note: { ...note, updated_at: new Date().toISOString() } })

    if (!navigator.onLine) {
      try {
        await enqueue({ type: 'upsert', payload: note })
      } catch (err) {
        console.error('Failed to queue save:', err.message)
      }
      return
    }

    try {
      const { error } = await supabase.from(NOTES_TABLE).upsert(note)
      if (error) {
        console.error('Save failed, queuing:', error.message)
        await enqueue({ type: 'upsert', payload: note })
      }
    } catch (err) {
      console.error('Unexpected save error, queuing:', err.message)
      await enqueue({ type: 'upsert', payload: note })
    }
  }, [])

  const deleteNote = useCallback(async (id) => {
    dispatch({ type: 'DELETE', id })

    if (!navigator.onLine) {
      try {
        await enqueue({ type: 'delete', payload: { id } })
      } catch (err) {
        console.error('Failed to queue delete:', err.message)
      }
      return
    }

    try {
      const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', id)
      if (error) {
        console.error('Delete failed, queuing:', error.message)
        await enqueue({ type: 'delete', payload: { id } })
      }
    } catch (err) {
      console.error('Unexpected delete error, queuing:', err.message)
      await enqueue({ type: 'delete', payload: { id } })
    }
  }, [])

  const createNote = useCallback(() => {
    const note = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: '',
      body: '',
      category_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    saveNote(note)
    return note.id
  }, [userId, saveNote])

  return { notes, saveNote, deleteNote, createNote }
}
