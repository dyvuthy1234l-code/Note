import { Clock, Heart, Pin, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategoryMeta } from '../data/categories'
import { getReadingTime, relativeTime } from '../utils/formatters'

// Extract first image src from HTML/Markdown content
function extractFirstImage(content) {
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/)
  if (htmlMatch) return htmlMatch[1]
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/)
  if (mdMatch) return mdMatch[1]
  return null
}

export default function NoteCard({ note, onFavorite, onPinned }) {
  const meta = getCategoryMeta(note.category)
  const Icon = meta.icon
  const excerpt = note.content.replace(/<[^>]+>/g, '').replace(/[#*`>_[\]()]/g, '').slice(0, 150)
  const thumbnail = extractFirstImage(note.content) || note.imageUrl

  return (
    <article
      className="glass-card group flex h-full flex-col rounded-2xl overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-sky-300/30"
      style={note.coverColor ? { borderLeft: `4px solid ${note.coverColor}` } : {}}
    >
      {/* Cover color accent strip */}
      {note.coverColor && !thumbnail && (
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${note.coverColor}99, ${note.coverColor}22)`,
          }}
        />
      )}

      {/* Thumbnail */}
      {thumbnail && (
        <div className="h-36 w-full overflow-hidden border-b border-white/10 relative">
          {note.coverColor && (
            <div
              className="absolute inset-x-0 bottom-0 h-1"
              style={{ background: note.coverColor }}
            />
          )}
          <img
            src={thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.glow} ${meta.color}`}>
            <Icon size={19} />
          </div>
          <div className="flex gap-2">
            <button
              className={`icon-btn h-9 w-9 ${note.pinned ? 'text-champagne' : ''}`}
              onClick={() => onPinned(note.id)}
              aria-label="Pin note"
            >
              <Pin size={16} />
            </button>
            <button
              className={`icon-btn h-9 w-9 ${note.favorite ? 'text-rose-300' : ''}`}
              onClick={() => onFavorite(note.id)}
              aria-label="Favorite note"
            >
              <Heart size={16} fill={note.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <Link to={`/notes/${note.id}`} className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sky-300">{note.category}</p>
          <h2 className="line-clamp-2 text-lg font-black leading-tight text-white">{note.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{excerpt || 'No content yet.'}</p>
        </Link>

        <div className="mt-5 flex flex-wrap gap-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} />
            {relativeTime(note.updatedAt)}
          </span>
          <span>{getReadingTime(note.content)} min read</span>
        </div>
      </div>
    </article>
  )
}
