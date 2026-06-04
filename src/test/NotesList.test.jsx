import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import NotesList from '../pages/NotesList'

vi.mock('../hooks/useNotes', () => ({
  useNotes: vi.fn(() => ({
    notes: [
      { id: '1', title: 'Meeting notes', body: 'Discussed project timeline', updated_at: new Date().toISOString() },
      { id: '2', title: '',              body: '',                           updated_at: new Date().toISOString() }
    ],
    createNote: vi.fn(() => 'new-id'),
    deleteNote: vi.fn(),
    saveNote:   vi.fn()
  }))
}))

function renderList() {
  return render(
    <AuthContext.Provider value={{ session: { user: { id: 'u1' } }, signOut: vi.fn() }}>
      <MemoryRouter>
        <NotesList />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('NotesList', () => {
  it('renders existing notes', () => {
    renderList()
    expect(screen.getByText('Meeting notes')).toBeInTheDocument()
    expect(screen.getByText('Untitled')).toBeInTheDocument()
  })

  it('shows preview text for notes with body content', () => {
    renderList()
    expect(screen.getByText('Discussed project timeline')).toBeInTheDocument()
  })

  it('shows "Empty note" for notes with no body', () => {
    renderList()
    expect(screen.getByText('Empty note')).toBeInTheDocument()
  })
})
