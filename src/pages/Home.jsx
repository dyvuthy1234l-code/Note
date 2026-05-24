import { ArrowRight, BookOpen, Bug, Pin, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import { useNotes } from '../context/NotesContext'

export default function Home() {
  const { notes, toggleFavorite, togglePinned } = useNotes()
  const pinned = notes.filter((note) => note.pinned).slice(0, 3)
  const recent = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="luxury-panel overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-300">MyDevWiki</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Keep notes, fixes, tasks, and learning logs in one sharp workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Built for quick capture and clean review: Markdown editor, code preview, tags, pinned notes, and fast search.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/notes/new">
                <Plus size={16} />
                New note
              </Link>
              <Link className="btn-ghost" to="/notes">
                Browse notes
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              [BookOpen, `${notes.length} notes`, 'Your personal knowledge base'],
              [Pin, `${pinned.length} pinned`, 'Important items stay visible'],
              [Bug, `${notes.filter((note) => note.category === 'Errors').length} fixes`, 'Debug history for later'],
              [Search, 'Search ready', 'Find by title, tags, or content'],
            ].map(([Icon, title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-300">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="font-black text-white">{title}</p>
                    <p className="text-xs text-slate-400">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">Pinned Notes</h2>
          <Link className="btn-ghost" to="/notes">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(pinned.length ? pinned : recent).map((note) => (
            <NoteCard key={note.id} note={note} onFavorite={toggleFavorite} onPinned={togglePinned} />
          ))}
        </div>
      </section>
    </div>
  )
}
