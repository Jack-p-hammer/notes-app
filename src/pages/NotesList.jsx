import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { CategoryBadge } from '../components/CategoryBadge'
import { CategoryManager } from '../components/CategoryManager'

const LABELS = {
  title: 'Notes',
  newNoteTitle: 'New note',
  signOut: 'Sign out',
  manageCategories: 'Categories',
  filterAll: 'All',
  offlineBanner: 'You are offline \u2014 changes will sync when reconnected',
  emptyState: 'No notes yet.',
  emptyStateAction: 'Create your first note',
  emptyFiltered: 'No notes in this category.',
  untitled: 'Untitled',
  emptyNote: 'Empty note',
  deleteTitle: 'Delete note',
  deleteConfirm: 'Delete this note?',
  newNoteIcon: '\uff0b',
  deleteIcon: '\u2715',
}

const PREVIEW_MAX_LENGTH = 80

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getNotePreview(note) {
  const text = stripHtml(note.body).trim()
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
  const { categories, createCategory, deleteCategory } = useCategories()
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState(null)
  const [showManager, setShowManager] = useState(false)

  const handleNew = () => {
    const id = createNote()
    navigate(`/note/${id}`)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm(LABELS.deleteConfirm)) deleteNote(id)
  }

  const toggleFilter = (id) => {
    setActiveFilter((prev) => (prev === id ? null : id))
  }

  const visibleNotes = activeFilter
    ? notes.filter((n) => (n.category_ids ?? []).includes(activeFilter))
    : notes

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>{LABELS.title}</h1>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => setShowManager((v) => !v)}>
            {LABELS.manageCategories}
          </button>
          <button className="btn-icon" onClick={handleNew} title={LABELS.newNoteTitle}>
            {LABELS.newNoteIcon}
          </button>
          <button className="btn-ghost" onClick={signOut}>
            {LABELS.signOut}
          </button>
        </div>
      </header>

      {showManager && (
        <CategoryManager
          categories={categories}
          createCategory={createCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowManager(false)}
        />
      )}

      {categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`filter-chip${activeFilter === null ? ' active' : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            {LABELS.filterAll}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-chip${activeFilter === cat.id ? ' active' : ''}`}
              style={activeFilter === cat.id ? { background: cat.color, borderColor: cat.color } : {}}
              onClick={() => toggleFilter(cat.id)}
            >
              <span className="filter-dot" style={{ background: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {!navigator.onLine && (
        <div className="offline-banner">{LABELS.offlineBanner}</div>
      )}

      {visibleNotes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">{activeFilter ? '\uD83D\uDD0D' : '\uD83D\uDDD2'}</span>
          <p>{activeFilter ? LABELS.emptyFiltered : LABELS.emptyState}</p>
          {!activeFilter && (
            <button onClick={handleNew}>{LABELS.emptyStateAction}</button>
          )}
        </div>
      ) : (
        <ul className="notes-list">
          {visibleNotes.map((note) => {
            const noteCategories = categories.filter(
              (c) => (note.category_ids ?? []).includes(c.id)
            )
            return (
              <li
                key={note.id}
                className="note-item"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <div className="note-item-content">
                  <span className="note-title">{note.title || LABELS.untitled}</span>
                  {noteCategories.length > 0 && (
                    <div className="note-categories">
                      {noteCategories.map((cat) => (
                        <CategoryBadge key={cat.id} category={cat} />
                      ))}
                    </div>
                  )}
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
            )
          })}
        </ul>
      )}
    </div>
  )
}
