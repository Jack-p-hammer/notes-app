import { useNavigate } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useAuth } from '../context/AuthContext'

const LABELS = {
  title: 'Notes',
  newNoteTitle: 'New note',
  signOut: 'Sign out',
  offlineBanner: 'You are offline \u2014 changes will sync when reconnected',
  emptyState: 'No notes yet.',
  emptyStateAction: 'Create your first note',
  untitled: 'Untitled',
  emptyNote: 'Empty note',
  deleteTitle: 'Delete note',
  deleteConfirm: 'Delete this note?',
  newNoteIcon: '\uff0b',
  deleteIcon: '\u2715',
}

const PREVIEW_MAX_LENGTH = 80

function getNotePreview(note) {
  const text = note.body.trim()
  if (!text) return LABELS.emptyNote
  return text.length > PREVIEW_MAX_LENGTH ? `${text.slice(0, PREVIEW_MAX_LENGTH)}\u2026` : text
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function NotesList() {
  const { notes, createNote, deleteNote } = useNotes()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleNew = () => {
    const id = createNote()
    navigate(`/note/${id}`)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm(LABELS.deleteConfirm)) deleteNote(id)
  }

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>{LABELS.title}</h1>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleNew} title={LABELS.newNoteTitle}>
            {LABELS.newNoteIcon}
          </button>
          <button className="btn-ghost" onClick={signOut}>
            {LABELS.signOut}
          </button>
        </div>
      </header>

      {!navigator.onLine && (
        <div className="offline-banner">{LABELS.offlineBanner}</div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>{LABELS.emptyState}</p>
          <button onClick={handleNew}>{LABELS.emptyStateAction}</button>
        </div>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li
              key={note.id}
              className="note-item"
              onClick={() => navigate(`/note/${note.id}`)}
            >
              <div className="note-item-content">
                <span className="note-title">{note.title || LABELS.untitled}</span>
                <span className="note-preview">{getNotePreview(note)}</span>
                <span className="note-date">{formatDate(note.updated_at)}</span>
              </div>
              <button
                className="btn-delete"
                onClick={(e) => handleDelete(e, note.id)}
                title={LABELS.deleteTitle}
              >
                {LABELS.deleteIcon}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
