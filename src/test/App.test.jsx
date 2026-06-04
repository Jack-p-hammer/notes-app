import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import App from '../App'

vi.mock('../hooks/useNotes', () => ({
  useNotes: vi.fn(() => ({
    notes: [],
    createNote: vi.fn(() => 'new-id'),
    deleteNote: vi.fn(),
    saveNote: vi.fn(),
  })),
}))

describe('App loading state', () => {
  it('shows loading indicator while session is resolving', () => {
    render(<App />)
    // While supabase.auth.getSession is pending, loading=true → shows loading div
    const loadingEl = document.querySelector('.loading')
    expect(loadingEl).not.toBeNull()
  })
})

function RequireAuthTest({ session, loading, children }) {
  return (
    <AuthContext.Provider value={{ session, loading, signOut: vi.fn(), signIn: vi.fn() }}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={children} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// Test RequireAuth behaviour by rendering App with known context
describe('RequireAuth', () => {
  it('redirects to /login when not authenticated and not loading', async () => {
    const { supabase } = await import('../lib/supabase')
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } })

    render(<App />)
    await waitFor(() => {
      // After loading resolves with no session, should show login content
      // App renders RequireAuth → Navigate to /login → Login page renders
      expect(document.querySelector('.auth-card')).not.toBeNull()
    })
  })
})
