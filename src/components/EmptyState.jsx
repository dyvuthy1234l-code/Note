import { BookOpen, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmptyState({ title = 'No notes found', description = 'Create a note and it will appear here.' }) {
  return (
    <div className="luxury-panel flex min-h-80 flex-col items-center justify-center rounded-2xl px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-300">
        <BookOpen size={24} />
      </div>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      <Link className="btn-primary mt-5" to="/notes/new">
        <Plus size={16} />
        New note
      </Link>
    </div>
  )
}
