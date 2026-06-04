import { useState } from 'react'
import { CategoryBadge } from './CategoryBadge'

const PRESET_COLORS = [
  '#6366f1', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899',
]

const LABELS = {
  title: 'Manage Categories',
  close: '\u2715',
  namePlaceholder: 'New category name',
  createButton: 'Create',
  noneYet: 'No categories yet.',
  deleteConfirm: 'Delete this category? Notes will keep their data but lose this label.',
}

export function CategoryManager({ categories, createCategory, deleteCategory, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await createCategory(name.trim(), color)
    setName('')
  }

  const handleDelete = (id) => {
    if (window.confirm(LABELS.deleteConfirm)) deleteCategory(id)
  }

  return (
    <div className="category-manager">
      <div className="manager-header">
        <h2>{LABELS.title}</h2>
        <button className="btn-close" onClick={onClose}>{LABELS.close}</button>
      </div>

      {categories.length === 0 ? (
        <p className="manager-empty">{LABELS.noneYet}</p>
      ) : (
        <ul className="manager-list">
          {categories.map((cat) => (
            <li key={cat.id} className="manager-item">
              <CategoryBadge category={cat} />
              <button className="btn-delete" onClick={() => handleDelete(cat.id)}>
                {LABELS.close}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="manager-form">
        <div className="color-swatches">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="new-category-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={LABELS.namePlaceholder}
          />
          <button type="submit">{LABELS.createButton}</button>
        </div>
      </form>
    </div>
  )
}
