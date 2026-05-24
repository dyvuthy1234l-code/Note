import { useParams } from 'react-router-dom'
import NoteForm from '../components/NoteForm'
import PageHeader from '../components/PageHeader'
import { useNotes } from '../context/NotesContext'

export default function AddNote() {
  const { id } = useParams()
  const { notes, createNote, updateNote } = useNotes()
  const existing = id ? notes.find((n) => String(n.id) === id) : null

  const handleSubmit = async (values) => {
    const tagList = Array.isArray(values.tags)
      ? values.tags
      : values.tags.split(',').map((t) => t.trim()).filter(Boolean)

    const payload = { ...values, tags: tagList.join(',') }

    if (existing) {
      return updateNote(existing.id, payload)
    }
    return createNote(payload)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={existing ? 'Edit note' : 'New note'}
        title={existing ? existing.title : 'Create a note'}
        description={existing ? 'Update the content below.' : 'Add a new note to your wiki.'}
      />
      <NoteForm note={existing || undefined} onSubmit={handleSubmit} allNotes={notes} />
    </div>
  )
}
