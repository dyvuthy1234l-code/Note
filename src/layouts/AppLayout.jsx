import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Menu, Search, Settings, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery]             = useState('')
  const { user, logout } = useAuth()
  const { notes }        = useNotes()
  const navigate         = useNavigate()
  const profileRef       = useRef(null)
  const searchRef        = useRef(null)

  // 🎹 Global keyboard shortcuts
  useKeyboardShortcuts()

  const displayName    = user?.username || user?.email || 'User'
  const avatarInitial  = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  const results = query.trim()
    ? notes
        .filter((note) =>
          `${note.title} ${note.category} ${note.tags.join(' ')} ${note.content}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : []

  return (
    <div className="min-h-screen overflow-hidden lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 px-4 py-3 sm:px-6 lg:px-8">
          <div className="luxury-panel mx-auto flex max-w-7xl items-center gap-3 rounded-3xl px-3 py-3">
            <button className="icon-btn lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={20} />
            </button>

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-200/70" size={18} />
              <input
                ref={searchRef}
                className="input search-input h-12 pl-11"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes… (Ctrl+K)"
              />
              {query && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="glass-card absolute left-0 right-0 top-14 z-40 overflow-hidden rounded-3xl"
                  >
                    {results.map((note) => (
                      <button
                        key={note.id}
                        className="block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-0 hover:bg-violet-500/10"
                        onClick={() => { setQuery(''); navigate(`/notes/${note.id}`) }}
                      >
                        <p className="font-semibold text-white">{note.title}</p>
                        <p className="text-xs text-slate-400">
                          {note.category} — {note.tags.join(', ') || 'No tags'}
                        </p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden sm:block" ref={profileRef}>
              <button className="btn-ghost max-w-56" onClick={() => setProfileOpen((v) => !v)}>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500/20 text-xs font-black text-violet-100">
                  {avatarInitial}
                </span>
                <span className="hidden truncate xl:inline">{displayName}</span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="glass-card absolute right-0 top-14 w-72 rounded-3xl p-3"
                  >
                    <div className="border-b border-white/10 p-3">
                      <p className="truncate text-sm font-bold text-white">{displayName}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <button
                      className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => { setProfileOpen(false); navigate('/settings') }}
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserRound size={16} />
                      Profile
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10"
                      onClick={() => { setProfileOpen(false); logout(); navigate('/login', { replace: true }) }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
