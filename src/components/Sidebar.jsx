import { motion } from 'framer-motion'
import { BarChart3, BookOpen, BriefcaseBusiness, Bug, Home, LogOut, Plus, Settings, Sparkles, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../config'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/notes', label: 'Notes', icon: BookOpen },
  { to: '/notes/new', label: 'Add Note', icon: Plus },
  { to: '/internship', label: 'Internship Journal', icon: BriefcaseBusiness },
  { to: '/errors', label: 'Error Logs', icon: Bug },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = user?.username || user?.email || 'User'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  // FIX 6: NavLink with to="/" is active on every route because every path starts
  // with "/". Use an explicit isActive check based on exact pathname match.
  const getNavClass = (to) => ({ isActive: routerIsActive }) => {
    const exactlyActive = to === '/' ? location.pathname === '/' : routerIsActive
    return `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
      exactlyActive
        ? 'bg-violet-600 text-white shadow-glow'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl transition lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-3xl border border-violet-300/30 bg-violet-500/15 text-lg font-black text-white shadow-glow">
              M
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-champagne shadow-glow" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">{appConfig.appName}</p>
              <p className="text-xs font-medium text-slate-500">Private notes OS</p>
            </div>
          </NavLink>
          <button className="icon-btn lg:hidden" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }, index) => (
            <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.025 }}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={getNavClass(to)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-champagne">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-bold text-white">Capture with intent</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Ideas, tasks, bookmarks, and fixes stay organized in one polished workspace.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/60 text-sm font-black text-violet-200">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              className="btn-ghost mt-4 w-full"
              onClick={async () => {
                await logout()
                onClose()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
