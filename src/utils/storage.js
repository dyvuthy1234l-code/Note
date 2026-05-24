// ── Storage helpers ──────────────────────────────────────────────────────────
// All data (users, notes, settings) is stored in localStorage only.
// No backend required.

const SETTINGS_KEY   = 'mydevwiki.settings.v1'
const NOTES_KEY      = 'mydevwiki.notes.v2'
const USERS_KEY      = 'mydevwiki.users.v1'
const SESSION_KEY    = 'mydevwiki.session.v1'
const DRAFT_KEY      = 'mydevwiki.draft'
const HISTORY_PREFIX = 'mydevwiki.history.'
const STREAK_KEY     = 'mydevwiki.streak'
const LAST_WRITE_KEY = 'mydevwiki.lastWriteDate'

export const defaultSettings = { compactMode: false, previewMode: true, theme: 'dark' }

// ── Helpers ──────────────────────────────────────────────────────────────────
const userKey = (key, uid) => `${key}.${uid}`
const read    = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write   = (key, value) => localStorage.setItem(key, JSON.stringify(value))

// ── Settings ─────────────────────────────────────────────────────────────────
export function loadSettings(uid) {
  if (!uid) return defaultSettings
  return { ...defaultSettings, ...read(userKey(SETTINGS_KEY, uid), {}) }
}
export function saveSettings(uid, settings) {
  if (!uid) return
  write(userKey(SETTINGS_KEY, uid), settings)
}

// ── Users (local auth) ───────────────────────────────────────────────────────
export function getUsers() {
  return read(USERS_KEY, {})           // { [email]: { id, username, email, passwordHash } }
}
function saveUsers(users) { write(USERS_KEY, users) }

// Very basic hash — not cryptographic, just obfuscation for local demo
function hashPassword(pw) {
  let h = 5381
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i)
  return (h >>> 0).toString(36)
}

export function localRegister({ username, email, password }) {
  const users = getUsers()
  if (users[email]) throw new Error('An account with this email already exists.')
  const user = { id: crypto.randomUUID(), username, email, passwordHash: hashPassword(password) }
  users[email] = user
  saveUsers(users)
  const { passwordHash: _, ...safe } = user
  return safe
}

export function localLogin({ email, password }) {
  const users = getUsers()
  const user  = users[email]
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error('Invalid email or password.')
  }
  const { passwordHash: _, ...safe } = user
  return safe
}

// ── Session ──────────────────────────────────────────────────────────────────
export function saveSession(user) { write(SESSION_KEY, user) }
export function loadSession()     { return read(SESSION_KEY, null) }
export function clearSession()    { localStorage.removeItem(SESSION_KEY) }

// ── Notes ────────────────────────────────────────────────────────────────────
export function loadNotes(uid) {
  if (!uid) return []
  return read(userKey(NOTES_KEY, uid), [])
}
export function saveNotes(uid, notes) {
  if (!uid) return
  write(userKey(NOTES_KEY, uid), notes)
}

// ── Draft (auto-save) ────────────────────────────────────────────────────────
export function saveDraft(values) {
  write(DRAFT_KEY, { ...values, _savedAt: Date.now() })
}
export function loadDraft() {
  return read(DRAFT_KEY, null)
}
export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

// ── Version History ──────────────────────────────────────────────────────────
const MAX_SNAPSHOTS = 10

export function saveSnapshot(noteId, values) {
  const key = HISTORY_PREFIX + noteId
  const existing = read(key, [])
  const snapshot = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    title: values.title,
    content: values.content,
    tags: values.tags,
    category: values.category,
  }
  const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS)
  write(key, updated)
}

export function loadSnapshots(noteId) {
  return read(HISTORY_PREFIX + noteId, [])
}

// ── Writing Streak ───────────────────────────────────────────────────────────
export function updateStreak() {
  const today = new Date().toISOString().slice(0, 10)
  const lastDate = localStorage.getItem(LAST_WRITE_KEY)
  let streak = read(STREAK_KEY, 0)

  if (!lastDate) {
    streak = 1
  } else if (lastDate === today) {
    // same day — no change
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    streak = lastDate === yesterday ? streak + 1 : 1
  }

  localStorage.setItem(LAST_WRITE_KEY, today)
  write(STREAK_KEY, streak)
  return streak
}

export function loadStreak() {
  return {
    streak: read(STREAK_KEY, 0),
    lastDate: localStorage.getItem(LAST_WRITE_KEY),
  }
}
