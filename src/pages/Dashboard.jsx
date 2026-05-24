import { BookOpen, Clock, Flame, Heart, Pin, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import PageHeader from '../components/PageHeader'
import { useNotes } from '../context/NotesContext'
import { categories } from '../data/categories'
import { relativeTime } from '../utils/formatters'
import { loadStreak } from '../utils/storage'

function streakMessage(streak) {
  if (streak === 0) return 'Start writing to build your streak!'
  if (streak === 1) return 'Great start — come back tomorrow!'
  if (streak < 5)  return 'Keep it going — you\'re on a roll!'
  if (streak < 10) return 'Impressive consistency!'
  if (streak < 30) return 'You\'re a writing machine! 🚀'
  return 'Legendary dedication! 🏆'
}

function StatCard({ icon: Icon, label, value, tone = 'text-sky-300' }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ${tone}`}>
        <Icon size={19} />
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function StreakCard({ streak }) {
  const msg = streakMessage(streak)
  return (
    <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
        <Flame size={19} />
      </div>
      <p className="text-3xl font-black text-white flex items-center gap-2">
        🔥 {streak}
        <span className="text-lg text-amber-300">{streak === 1 ? 'day' : 'days'}</span>
      </p>
      <p className="mt-1 text-sm text-slate-400">Writing streak</p>
      <p className="mt-2 text-xs font-semibold text-amber-400/80">{msg}</p>
    </div>
  )
}

export default function Dashboard() {
  const { notes, toggleFavorite, togglePinned } = useNotes()
  const recent = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  const favoriteCount = notes.filter((note) => note.favorite).length
  const pinnedCount = notes.filter((note) => note.pinned).length
  const lastUpdated = recent[0]?.updatedAt ? relativeTime(recent[0].updatedAt) : 'No notes yet'

  const [streak, setStreak] = useState(0)
  useEffect(() => {
    const { streak: s } = loadStreak()
    setStreak(s)
  }, [])

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Dashboard"
        title="Workspace overview"
        description="A clean snapshot of your notes, categories, recent edits, and pinned knowledge."
        action={
          <Link className="btn-primary" to="/notes/new">
            <Plus size={16} />
            New note
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={BookOpen} label="Total notes" value={notes.length} />
        <StatCard icon={Pin} label="Pinned notes" value={pinnedCount} tone="text-champagne" />
        <StatCard icon={Heart} label="Favorites" value={favoriteCount} tone="text-rose-300" />
        <StatCard icon={Clock} label="Last update" value={lastUpdated} tone="text-emerald-300" />
        <StreakCard streak={streak} />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-4 text-xl font-black text-white">Recent Notes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((note) => (
              <NoteCard key={note.id} note={note} onFavorite={toggleFavorite} onPinned={togglePinned} />
            ))}
          </div>
        </div>

        <aside className="glass-card rounded-2xl p-4">
          <h2 className="mb-4 text-xl font-black text-white">Categories</h2>
          <div className="space-y-2">
            {categories.map(({ name, icon: Icon, color, glow }) => {
              const count = notes.filter((note) => note.category === name).length
              return (
                <Link key={name} to={`/notes?category=${encodeURIComponent(name)}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                  <span className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${glow} ${color}`}>
                      <Icon size={16} />
                    </span>
                    <span className="font-bold text-white">{name}</span>
                  </span>
                  <span className="text-sm font-black text-slate-400">{count}</span>
                </Link>
              )
            })}
          </div>
        </aside>
      </section>
    </div>
  )
}
