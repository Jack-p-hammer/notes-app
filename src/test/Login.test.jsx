import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import Login from '../pages/Login'

const mockSignIn = vi.fn()

function renderLogin() {
  return render(
    <AuthContext.Provider value={{ signIn: mockSignIn, session: null, loading: false }}>
      <Login />
    </AuthContext.Provider>
  )
}

describe('Login', () => {
  it('renders the email input and submit button', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
  })

  it('calls signIn with the entered email', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('test@example.com'))
  })

  it('shows confirmation message after successful sign-in', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument())
  })

  it('shows an error message when sign-in fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Rate limit exceeded' } })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    await waitFor(() => expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument())
  })
})
