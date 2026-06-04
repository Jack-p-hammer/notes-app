import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import NoteEdit from '../pages/NoteEdit'

const mockSaveNote = vi.fn()

vi.mock('../hooks/useNotes', () => ({
  useNotes: vi.fn(() => ({
    notes: [
      {
        id: 'note-1',
        title: 'My Note',
        body: 'Some content here',
        user_id: 'u1',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    saveNote: mockSaveNote,
    createNote: vi.fn(() => 'new-id'),
    deleteNote: vi.fn(),
  })),
}))

function renderNoteEdit(noteId = 'note-1') {
  return render(
    <AuthContext.Provider value={{ session: { user: { id: 'u1' } }, signOut: vi.fn() }}>
      <MemoryRouter initialEntries={[`/note/${noteId}`]}>
        <Routes>
          <Route path="/note/:id" element={<NoteEdit />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('NoteEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and body inputs', () => {
    renderNoteEdit()
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Start writing\u2026')).toBeInTheDocument()
  })

  it('populates inputs with note content', () => {
    renderNoteEdit()
    expect(screen.getByPlaceholderText('Title').value).toBe('My Note')
    expect(screen.getByPlaceholderText('Start writing\u2026').value).toBe('Some content here')
  })

  it('shows "Note not found" for unknown note id', () => {
    renderNoteEdit('unknown-id')
    expect(screen.getByText('Note not found.')).toBeInTheDocument()
  })

  it('shows back button', () => {
    renderNoteEdit()
    expect(screen.getByText('\u2190 Notes')).toBeInTheDocument()
  })

  it('shows "Saved" status initially', () => {
    renderNoteEdit()
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('shows saving status when title is changed', () => {
    renderNoteEdit()
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Updated Title' } })
    expect(screen.getByText('Saving\u2026')).toBeInTheDocument()
  })

  it('shows saving status when body is changed', () => {
    renderNoteEdit()
    fireEvent.change(screen.getByPlaceholderText('Start writing\u2026'), { target: { value: 'New body' } })
    expect(screen.getByText('Saving\u2026')).toBeInTheDocument()
  })

  it('navigates back to home from the not-found back button', () => {
    renderNoteEdit('unknown-id')
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('navigates back to home when the back arrow is clicked', () => {
    renderNoteEdit()
    fireEvent.click(screen.getByText('\u2190 Notes'))
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
})
