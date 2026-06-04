import { supabase } from './supabase'
import { getAllQueued, dequeue } from './offlineQueue'

export async function drainQueue() {
  try {
    const items = await getAllQueued()
    for (const item of items) {
      try {
        if (item.type === 'upsert') {
          const { error } = await supabase.from('notes').upsert(item.payload)
          if (error) throw error
        } else if (item.type === 'delete') {
          const { error } = await supabase.from('notes').delete().eq('id', item.payload.id)
          if (error) throw error
        }
        await dequeue(item.key)
      } catch (err) {
        console.warn('Queue item failed, will retry:', err.message)
        break
      }
    }
  } catch (err) {
    console.error('Failed to drain queue:', err.message)
  }
}
