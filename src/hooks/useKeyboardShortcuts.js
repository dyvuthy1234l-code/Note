import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Global keyboard shortcuts:
 *   Ctrl/Cmd + K  → focus the search bar (if any .search-input on page)
 *   Ctrl/Cmd + N  → navigate to /notes/new
 *   Ctrl/Cmd + D  → navigate to /dashboard
 *   Escape         → blur focused input
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector('.search-input')
        if (input) input.focus()
      }
      if (mod && e.key === 'n') {
        e.preventDefault()
        navigate('/notes/new')
      }
      if (mod && e.key === 'd') {
        e.preventDefault()
        navigate('/dashboard')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])
}
