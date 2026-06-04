import { useEffect, useRef } from 'react'
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
  // Tracks whether the last content change came from user typing in this editor.
  // If true, we skip syncing the content prop back into the editor (would reset cursor).
  const internalChangeRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: content || '',
    onUpdate: ({ editor: e }) => {
      internalChangeRef.current = true
      onChange(e.getHTML())
    },
  })

  // Sync external content changes (e.g. note loaded from DB after async fetch)
  // into the editor without triggering another onUpdate cycle.
  useEffect(() => {
    if (!editor) return
    if (internalChangeRef.current) {
      internalChangeRef.current = false
      return
    }
    // false = don't emit onUpdate, so we don't loop back into onChange
    editor.commands.setContent(content || '', false)
  }, [content, editor])

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
