import { useState, useRef, useEffect } from 'react'
import { CategoryBadge } from './CategoryBadge'

const PRESET_COLORS = [
  '#6366f1', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899',
]

const LABELS = {
  addButton: '+ Category',
  noneYet: 'No categories yet — create one below',
  namePlaceholder: 'Category name',
  createButton: 'Create',
}

export function CategoryPicker({ categories, createCategory, categoryIds, onChange }) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleCategory = (id) => {
    const next = categoryIds.includes(id)
      ? categoryIds.filter((c) => c !== id)
      : [...categoryIds, id]
    onChange(next)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const cat = await createCategory(newName.trim(), selectedColor)
    if (cat) {
      onChange([...categoryIds, cat.id])
      setNewName('')
    }
  }

  const selected = categories.filter((c) => categoryIds.includes(c.id))

  return (
    <div className="category-picker" ref={ref}>
      <div className="category-picker-tags">
        {selected.map((cat) => (
          <CategoryBadge key={cat.id} category={cat} onRemove={() => toggleCategory(cat.id)} />
        ))}
        <button className="btn-add-category" onClick={() => setOpen((v) => !v)}>
          {LABELS.addButton}
        </button>
      </div>

      {open && (
        <div className="category-dropdown">
          {categories.length === 0 ? (
            <p className="dropdown-empty">{LABELS.noneYet}</p>
          ) : (
            <ul className="category-list">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="category-option"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <span className="category-dot" style={{ background: cat.color }} />
                  <span className="category-option-name">{cat.name}</span>
                  {categoryIds.includes(cat.id) && <span className="check">&#10003;</span>}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreate} className="new-category-form">
            <div className="color-swatches">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch${selectedColor === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
            <div className="new-category-row">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={LABELS.namePlaceholder}
              />
              <button type="submit">{LABELS.createButton}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
