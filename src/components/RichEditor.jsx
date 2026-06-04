import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'

const LABELS = {
  bold: 'Bold',
  italic: 'Italic',
  checklist: 'Checklist',
}

export function RichEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: content || '',
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        <button
          type="button"
          className={`toolbar-btn${editor.isActive('bold') ? ' is-active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          title={LABELS.bold}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`toolbar-btn${editor.isActive('italic') ? ' is-active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          title={LABELS.italic}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`toolbar-btn${editor.isActive('taskList') ? ' is-active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleTaskList().run() }}
          title={LABELS.checklist}
        >
          &#9745;
        </button>
      </div>
      <EditorContent editor={editor} className="rich-editor-content" />
    </div>
  )
}
