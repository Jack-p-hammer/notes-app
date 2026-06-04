import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useCategories } from '../hooks/useCategories'
import { RichEditor } from '../components/RichEditor'
import { CategoryPicker } from '../components/CategoryPicker'

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
  const { categories, createCategory } = useCategories()
  const navigate = useNavigate()
  const note = notes.find((n) => n.id === id)

  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [categoryIds, setCategoryIds] = useState(note?.category_ids ?? [])
  const [saved, setSaved] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (note && saved) {
      setTitle(note.title)
      setBody(note.body)
      setCategoryIds(note.category_ids ?? [])
    }
  // Only sync on external updates (realtime), identified by updated_at changing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.updated_at])

  const scheduleAutoSave = useCallback(
    (newTitle, newBody) => {
      setSaved(false)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveNote({ ...note, title: newTitle, body: newBody, category_ids: categoryIds })
        setSaved(true)
      }, AUTOSAVE_MS)
    },
    [note, saveNote, categoryIds]
  )

  const handleTitle = (e) => {
    setTitle(e.target.value)
    scheduleAutoSave(e.target.value, body)
  }

  const handleBody = (newBody) => {
    setBody(newBody)
    scheduleAutoSave(title, newBody)
  }

  const handleCategoryChange = (newIds) => {
    setCategoryIds(newIds)
    saveNote({ ...note, title, body, category_ids: newIds })
  }

  useEffect(() => {
    return () => { clearTimeout(timerRef.current) }
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
        <span className={`save-status ${saved ? 'is-saved' : 'is-saving'}`}>
          {saved ? LABELS.saved : LABELS.saving}
        </span>
      </header>

      <input
        className="title-input"
        placeholder={LABELS.titlePlaceholder}
        value={title}
        onChange={handleTitle}
        autoFocus={!title}
      />

      <CategoryPicker
        categories={categories}
        createCategory={createCategory}
        categoryIds={categoryIds}
        onChange={handleCategoryChange}
      />

      <RichEditor
        content={body}
        onChange={handleBody}
        placeholder={LABELS.bodyPlaceholder}
      />
    </div>
  )
}
