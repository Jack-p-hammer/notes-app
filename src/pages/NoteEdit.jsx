import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'

const AUTOSAVE_MS = 800

const LABELS = {
  back: '\u2190 Notes',
  saved: 'Saved',
  saving: 'Saving\u2026',
  titlePlaceholder: 'Title',
  bodyPlaceholder: 'Start writing\u2026',
  notFound: 'Note not found.',
  backButton: 'Back',
}

export default function NoteEdit() {
  const { id } = useParams()
  const { notes, saveNote } = useNotes()
  const navigate = useNavigate()
  const note = notes.find((n) => n.id === id)
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [saved, setSaved] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (note && saved) {
      setTitle(note.title)
      setBody(note.body)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.updated_at])

  const scheduleAutoSave = useCallback(
    (newTitle, newBody) => {
      setSaved(false)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveNote({ ...note, title: newTitle, body: newBody })
        setSaved(true)
      }, AUTOSAVE_MS)
    },
    [note, saveNote]
  )

  const handleTitle = (e) => {
    setTitle(e.target.value)
    scheduleAutoSave(e.target.value, body)
  }

  const handleBody = (e) => {
    setBody(e.target.value)
    scheduleAutoSave(title, e.target.value)
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])

  if (!note) {
    return (
      <div className="loading">
        {LABELS.notFound}{' '}
        <button onClick={() => navigate('/')}>{LABELS.backButton}</button>
      </div>
    )
  }

  return (
    <div className="edit-page">
      <header className="edit-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          {LABELS.back}
        </button>
        <span className="save-status">{saved ? LABELS.saved : LABELS.saving}</span>
      </header>
      <input
        className="title-input"
        placeholder={LABELS.titlePlaceholder}
        value={title}
        onChange={handleTitle}
        autoFocus={!title}
      />
      <textarea
        className="body-input"
        placeholder={LABELS.bodyPlaceholder}
        value={body}
        onChange={handleBody}
      />
    </div>
  )
}
