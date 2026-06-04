import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES_TABLE = 'categories'

export function useCategories() {
  const { session } = useAuth()
  const [categories, setCategories] = useState([])
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return
    supabase
      .from(CATEGORIES_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch categories:', error.message)
          return
        }
        if (data) setCategories(data)
      })
  }, [userId])

  const createCategory = useCallback(
    async (name, color) => {
      if (!userId) return null
      try {
        const { data, error } = await supabase
          .from(CATEGORIES_TABLE)
          .insert({ name, color, user_id: userId })
          .select()
          .single()
        if (error) throw error
        setCategories((prev) => [...prev, data])
        return data
      } catch (err) {
        console.error('Failed to create category:', err.message)
        return null
      }
    },
    [userId]
  )

  const deleteCategory = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from(CATEGORIES_TABLE)
        .delete()
        .eq('id', id)
      if (error) throw error
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Failed to delete category:', err.message)
    }
  }, [])

  return { categories, createCategory, deleteCategory }
}
