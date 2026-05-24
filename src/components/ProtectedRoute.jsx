import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
      <div className="glass-card rounded-2xl p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-sky-300">MyDevWiki</p>
        <p className="mt-2 text-slate-300">Checking your session...</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return children
}
