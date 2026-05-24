import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearSession,
  loadSession,
  localLogin,
  localRegister,
  saveSession,
} from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const stored = loadSession()
    if (stored) setUser(stored)
    setLoading(false)
  }, [])

  const value = useMemo(() => {
    const register = ({ username, email, password }) => {
      const u = localRegister({ username, email, password })
      saveSession(u)
      setUser(u)
      return u
    }

    const login = ({ email, password }) => {
      const u = localLogin({ email, password })
      saveSession(u)
      setUser(u)
      return u
    }

    const logout = () => {
      clearSession()
      setUser(null)
    }

    // kept for API-compat with the rest of the codebase
    const getToken = () => null

    return { user, loading, login, register, logout, getToken }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
