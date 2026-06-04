import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'

const { supabase } = await import('../lib/supabase')

function ConsumerComponent() {
  const { session, loading, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? 'logged-in' : 'logged-out'}</span>
      <button onClick={() => signIn('test@example.com')}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  })

  it('starts in loading state', () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    expect(screen.getByTestId('loading').textContent).toBe('true')
  })

  it('resolves loading after session check', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('shows logged-out when session is null', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('session').textContent).toBe('logged-out')
    })
  })

  it('shows logged-in when session is present', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 'test@example.com' } } }
    })
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('session').textContent).toBe('logged-in')
    })
  })

  it('calls signInWithOtp when signIn is invoked', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    act(() => {
      screen.getByText('Sign In').click()
    })
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: { emailRedirectTo: expect.any(String) }
    })
  })

  it('calls signOut when signOut is invoked', async () => {
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    act(() => {
      screen.getByText('Sign Out').click()
    })
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('updates session on auth state change', async () => {
    let authChangeCallback
    supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      authChangeCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    )
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
    act(() => {
      authChangeCallback('SIGNED_IN', { user: { id: 'u2' } })
    })
    await waitFor(() => {
      expect(screen.getByTestId('session').textContent).toBe('logged-in')
    })
  })
})
