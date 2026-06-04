const LABELS = {
  removeTitle: 'Remove category',
}

export function CategoryBadge({ category, onRemove }) {
  return (
    <span className="category-badge" style={{ backgroundColor: category.color }}>
      {category.name}
      {onRemove && (
        <button
          className="badge-remove"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          title={LABELS.removeTitle}
        >
          ×
        </button>
      )}
    </span>
  )
}
