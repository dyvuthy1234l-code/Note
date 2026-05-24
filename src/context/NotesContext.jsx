import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { categoryNames } from '../data/categories'
import { useAuth } from './AuthContext.jsx'
import {
  defaultSettings,
  loadNotes,
  loadSettings,
  saveNotes,
  saveSettings,
} from '../utils/storage'

const NotesContext = createContext(null)

function normalizeNote(note) {
  return {
    ...note,
    tags: Array.isArray(note.tags)
      ? note.tags
      : String(note.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    category: categoryNames.includes(note.category) ? note.category : 'JavaScript',
    favorite: Boolean(note.favorite),
    pinned:   Boolean(note.pinned),
  }
}

export function NotesProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.id

  const [notes,    setNotes]    = useState([])
  const [settings, setSettings] = useState(defaultSettings)
  const [loadingNotes, setLoadingNotes] = useState(false)

  // Load notes from localStorage when user changes
  useEffect(() => {
    if (!uid) { setNotes([]); return }
    setLoadingNotes(true)
    const stored = loadNotes(uid).map(normalizeNote)
    setNotes(stored)
    setLoadingNotes(false)
  }, [uid])

  // Persist notes whenever they change
  const persistNotes = useCallback((next) => {
    setNotes(next)
    if (uid) saveNotes(uid, next)
  }, [uid])

  // Settings
  useEffect(() => {
    if (!uid) return
    setSettings(loadSettings(uid))
  }, [uid])

  useEffect(() => {
    if (!uid) return
    saveSettings(uid, settings)
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.classList.toggle('theme-light', settings.theme === 'light')
    document.documentElement.classList.toggle('theme-dark',  settings.theme !== 'light')
  }, [uid, settings])

  const value = useMemo(() => {
    const createNote = (note) => {
      const normalized = normalizeNote({
        ...note,
        id:        crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      persistNotes([normalized, ...notes])
      return normalized
    }

    const updateNote = (id, note) => {
      const normalized = normalizeNote({ ...note, id, updatedAt: new Date().toISOString() })
      persistNotes(notes.map((n) => (n.id === id ? normalized : n)))
      return normalized
    }

    const deleteNote = (id) => {
      persistNotes(notes.filter((n) => n.id !== id))
    }

    const toggleFavorite = (id) => {
      const note = notes.find((n) => n.id === id)
      if (!note) return
      updateNote(id, { ...note, favorite: !note.favorite })
    }

    const togglePinned = (id) => {
      const note = notes.find((n) => n.id === id)
      if (!note) return
      updateNote(id, { ...note, pinned: !note.pinned })
    }

    const resetWorkspace = () => {
      persistNotes([])
      setSettings(defaultSettings)
    }

    // ── NEW: import notes from JSON export ──────────────────────────────────
    const importNotes = (importedNotes) => {
      const merged = [...importedNotes.map(normalizeNote), ...notes]
      // de-dup by id
      const seen = new Set()
      const deduped = merged.filter((n) => {
        if (seen.has(n.id)) return false
        seen.add(n.id)
        return true
      })
      persistNotes(deduped)
      return deduped.length - notes.length  // returns count of newly added
    }

    return {
      notes,
      settings,
      setSettings,
      loadingNotes,
      createNote,
      updateNote,
      deleteNote,
      toggleFavorite,
      togglePinned,
      resetWorkspace,
      importNotes,
    }
  }, [notes, settings, loadingNotes, persistNotes])

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider')
  return ctx
}
