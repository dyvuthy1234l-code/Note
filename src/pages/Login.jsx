import { BookOpen, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../config'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const nextPath = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate(nextPath, { replace: true })
  }, [navigate, nextPath, user])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75 shadow-luxury backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left panel */}
        <div className="relative min-h-[480px] p-6 sm:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),transparent_35%),linear-gradient(45deg,rgba(124,58,237,0.22),transparent_45%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200">
                <BookOpen size={23} />
              </div>
              <div>
                <p className="text-xl font-black text-white">{appConfig.appName}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Private notes workspace</p>
              </div>
            </div>

            <div className="my-auto max-w-2xl py-12">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-bold text-sky-200">
                <Sparkles size={13} />
                Your wiki, your rules
              </p>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                Your personal wiki, polished enough to keep open all day.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{appConfig.appTagline}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Rich Editor', 'Format text, colors, and images.'],
                ['Private', 'Your notes, your account only.'],
                ['Organized', 'Categories, tags, pins, search.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="border-t border-white/10 p-6 sm:p-10 lg:border-l lg:border-t-0">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
              <LogIn size={25} />
            </div>
            <h2 className="text-2xl font-black text-white">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Sign in to your workspace to access your notes.</p>

            <form className="mt-8 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Password</span>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary mt-2 h-12 w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link to="/register" className="font-bold text-sky-300 hover:text-sky-200 transition">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
