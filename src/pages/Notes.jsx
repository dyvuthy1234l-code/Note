import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import NoteCard from '../components/NoteCard'
import PageHeader from '../components/PageHeader'
import { useNotes } from '../context/NotesContext'
import { categoryNames } from '../data/categories'

export default function Notes({ forcedCategory }) {
  const { notes, toggleFavorite, togglePinned } = useNotes()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const category = forcedCategory || params.get('category') || 'All'

  const filtered = useMemo(() => {
    return notes
      .filter((note) => category === 'All' || note.category === category)
      .filter((note) => {
        if (!query.trim()) return true
        return `${note.title} ${note.category} ${note.tags.join(' ')} ${note.content}`.toLowerCase().includes(query.toLowerCase())
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [category, notes, query])

  const changeCategory = (nextCategory) => {
    if (forcedCategory) return
    if (nextCategory === 'All') setParams({})
    else setParams({ category: nextCategory })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={forcedCategory || 'Library'}
        title={forcedCategory ? `${forcedCategory} notes` : 'All notes'}
        description="Filter, search, pin, and favorite your notes without leaving the workspace."
        action={
          <Link className="btn-primary" to="/notes/new">
            <Plus size={16} />
            New note
          </Link>
        }
      />

      <div className="luxury-panel rounded-2xl p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input className="input h-12 pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, tag, category, or content" />
          </div>
          {!forcedCategory && (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:pb-0">
              {['All', ...categoryNames].map((item) => (
                <button
                  key={item}
                  className={`shrink-0 rounded-2xl px-3.5 py-2 text-sm font-bold transition ${
                    category === item ? 'bg-sky-300 text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                  onClick={() => changeCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <SlidersHorizontal size={14} />
          Showing {filtered.length} of {notes.length} notes
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} onFavorite={toggleFavorite} onPinned={togglePinned} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing matched" description="Try another search or category, or create a new note for this area." />
      )}
    </div>
  )
}
