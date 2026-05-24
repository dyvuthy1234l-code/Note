import { ArrowLeft, Edit3, Heart, Pin, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MarkdownPreview from '../components/MarkdownPreview'
import { useNotes } from '../context/NotesContext'
import { getCategoryMeta } from '../data/categories'
import { formatDate, getReadingTime } from '../utils/formatters'

export default function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, deleteNote, toggleFavorite, togglePinned } = useNotes()
  const note = notes.find((item) => String(item.id) === id)

  if (!note) {
    return (
      <div className="luxury-panel rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-black text-white">Note not found</h1>
        <p className="mt-2 text-sm text-slate-400">It may have been deleted or moved.</p>
        <Link className="btn-primary mt-6" to="/notes">Back to notes</Link>
      </div>
    )
  }

  const meta = getCategoryMeta(note.category)
  const Icon = meta.icon

  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => togglePinned(note.id)}>
            <Pin size={16} />
            {note.pinned ? 'Pinned' : 'Pin'}
          </button>
          <button className="btn-ghost" onClick={() => toggleFavorite(note.id)}>
            <Heart size={16} fill={note.favorite ? 'currentColor' : 'none'} />
            Favorite
          </button>
          <Link className="btn-primary" to={`/notes/${note.id}/edit`}>
            <Edit3 size={16} />
            Edit
          </Link>
          <button
            className="btn-ghost text-rose-200 hover:bg-rose-500/10"
            onClick={async () => {
              await deleteNote(note.id)
              navigate('/notes', { replace: true })
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <header className="luxury-panel rounded-2xl p-6 sm:p-8">
        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${meta.glow} ${meta.color}`}>
          <Icon size={22} />
        </div>
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-300">{note.category}</p>
        <h1 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">{note.title}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span key={tag} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
          <span>Updated {formatDate(note.updatedAt)}</span>
          <span>{getReadingTime(note.content)} min read</span>
        </div>
      </header>

      <section className="glass-card rounded-2xl p-5 sm:p-7">
        <MarkdownPreview content={note.content} />
      </section>
    </article>
  )
}
