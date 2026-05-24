import {
  ArrowLeft,
  Bold,
  CheckSquare,
  ChevronDown,
  Clock,
  Eye,
  Expand,
  FileText,
  Heading2,
  History,
  Image,
  Italic,
  Loader2,
  RotateCcw,
  Save,
  Shrink,
  SplitSquareHorizontal,
  Type,
  Underline,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories, categoryNames } from '../data/categories'
import MarkdownPreview from './MarkdownPreview'
import { ConfettiCanvas, useConfetti } from './Confetti'
import {
  clearDraft,
  loadDraft,
  loadSnapshots,
  saveDraft,
  saveSnapshot,
  updateStreak,
} from '../utils/storage'

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Sky', value: '#38bdf8' },
  { label: 'Violet', value: '#a78bfa' },
  { label: 'Rose', value: '#fb7185' },
  { label: 'Amber', value: '#fbbf24' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Pink', value: '#f472b6' },
]

const COVER_COLORS = [
  { label: 'None', value: '' },
  { label: 'Sky', value: '#38bdf8' },
  { label: 'Violet', value: '#a78bfa' },
  { label: 'Rose', value: '#fb7185' },
  { label: 'Amber', value: '#fbbf24' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Orange', value: '#fb923c' },
  { label: 'Pink', value: '#f472b6' },
]

const FONT_SIZES = [
  { label: 'Font size…', tag: '' },
  { label: 'Small', tag: 'small' },
  { label: 'Normal', tag: 'p' },
  { label: 'Large', tag: 'h3' },
  { label: 'Heading', tag: 'h2' },
]

const TEMPLATES = [
  {
    label: 'Bug Report',
    title: 'Bug: [Short description]',
    content: `## Bug Report

**Summary:** 

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Environment:**
- OS: 
- Browser/Runtime: 
- Version: 

**Screenshots / Logs:**


**Priority:** High / Medium / Low
`,
  },
  {
    label: 'Meeting Notes',
    title: `Meeting — ${new Date().toLocaleDateString()}`,
    content: `## Meeting Notes — ${new Date().toLocaleDateString()}

**Attendees:**
- 

**Agenda:**
1. 
2. 

**Discussion:**


**Decisions Made:**
- 

**Action Items:**
- [ ] 
- [ ] 

**Next Meeting:**
`,
  },
  {
    label: 'Learning Log',
    title: `TIL — ${new Date().toLocaleDateString()}`,
    content: `## Today I Learned — ${new Date().toLocaleDateString()}

**Topic:**


**What I Learned:**


**Key Takeaways:**
- 
- 

**Code Example:**
\`\`\`js
// example
\`\`\`

**Resources:**
- 

**Questions / Next Steps:**
- 
`,
  },
  {
    label: 'Todo List',
    title: 'Todo — ' + new Date().toLocaleDateString(),
    content: `## Todo List

### 🔴 High Priority
- [ ] 
- [ ] 

### 🟡 Medium Priority
- [ ] 
- [ ] 

### 🟢 Low Priority
- [ ] 
- [ ] 

### ✅ Done
`,
  },
]

const emptyNote = {
  title: '',
  category: 'JavaScript',
  tags: '',
  content: '',
  favorite: false,
  pinned: false,
  coverColor: '',
}

export default function NoteForm({ note, onSubmit, allNotes = [] }) {
  const navigate = useNavigate()
  const { canvasRef, burst } = useConfetti()
  const isEditing = Boolean(note?.id)

  const [preview, setPreview] = useState(false)
  const [splitView, setSplitView] = useState(false)
  const [values, setValues] = useState(() => ({
    ...emptyNote,
    ...note,
    tags: Array.isArray(note?.tags) ? note.tags.join(', ') : note?.tags || '',
  }))
  const [selectedColor, setSelectedColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  // Draft
  const [draftBanner, setDraftBanner] = useState(false)

  // Find & Replace
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [matchIndex, setMatchIndex] = useState(0)

  // Templates dropdown
  const [showTemplates, setShowTemplates] = useState(false)
  const templateRef = useRef(null)

  // Note linking autocomplete
  const [linkQuery, setLinkQuery] = useState('')
  const [showLinkDropdown, setShowLinkDropdown] = useState(false)
  const [linkDropdownPos, setLinkDropdownPos] = useState({ top: 0, left: 0 })
  const [linkTriggerStart, setLinkTriggerStart] = useState(-1)

  // Version history
  const [showHistory, setShowHistory] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [previewSnapshot, setPreviewSnapshot] = useState(null)

  // Focus mode
  const [focusMode, setFocusMode] = useState(false)

  const textareaRef = useRef(null)
  const textareaWrapRef = useRef(null)

  // ── Draft restore on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isEditing) {
      const draft = loadDraft()
      if (draft?._savedAt && (draft.title || draft.content)) {
        setDraftBanner(true)
      }
    }
  }, [isEditing])

  // ── Auto-save draft every 3s ──────────────────────────────────────────────
  const draftTimer = useRef(null)
  useEffect(() => {
    if (isEditing) return
    if (draftTimer.current) clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => {
      if (values.title || values.content) saveDraft(values)
    }, 3000)
    return () => clearTimeout(draftTimer.current)
  }, [values, isEditing])

  // Clear draft on unmount if not editing
  useEffect(() => {
    return () => {
      if (!isEditing) clearDraft()
    }
  }, [isEditing])

  // ── Load history when opening history panel ───────────────────────────────
  useEffect(() => {
    if (showHistory && note?.id) {
      setSnapshots(loadSnapshots(note.id))
    }
  }, [showHistory, note?.id])

  // ── Find & replace match count ────────────────────────────────────────────
  useEffect(() => {
    if (!findText) { setMatchCount(0); return }
    try {
      const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      setMatchCount((values.content.match(re) || []).length)
      setMatchIndex(0)
    } catch { setMatchCount(0) }
  }, [findText, values.content])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowFindReplace((v) => !v)
      }
      if (e.key === 'Escape') {
        setFocusMode(false)
        setShowHistory(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Close template dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (templateRef.current && !templateRef.current.contains(e.target)) {
        setShowTemplates(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const wordCount = useMemo(
    () =>
      values.content
        .replace(/<[^>]+>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    [values.content],
  )

  const charCount = values.content.replace(/<[^>]+>/g, '').length

  const update = (field, value) => setValues((c) => ({ ...c, [field]: value }))

  const insertAtCursor = (before, after = '') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end   = el.selectionEnd
    const content = el.value
    const selected = content.slice(start, end)
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end)
    update('content', newContent)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  // ── Checklist button ──────────────────────────────────────────────────────
  const applyChecklist = () => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const content = el.value
    if (start === end) {
      // No selection — insert a single checklist item
      const lineStart = content.lastIndexOf('\n', start - 1) + 1
      const newContent = content.slice(0, lineStart) + '- [ ] ' + content.slice(lineStart)
      update('content', newContent)
      setTimeout(() => el.setSelectionRange(lineStart + 6, lineStart + 6), 0)
    } else {
      // Wrap each selected line
      const selected = content.slice(start, end)
      const wrapped = selected.split('\n').map((line) => `- [ ] ${line}`).join('\n')
      const newContent = content.slice(0, start) + wrapped + content.slice(end)
      update('content', newContent)
      setTimeout(() => el.setSelectionRange(start, start + wrapped.length), 0)
    }
  }

  // ── Note linking autocomplete ─────────────────────────────────────────────
  const handleTextareaChange = (e) => {
    const val = e.target.value
    update('content', val)
    const cursorPos = e.target.selectionStart
    // detect [[
    const textBefore = val.slice(0, cursorPos)
    const match = textBefore.match(/\[\[([^\][\n]*)$/)
    if (match) {
      setLinkQuery(match[1])
      setLinkTriggerStart(textBefore.length - match[0].length)
      setShowLinkDropdown(true)
      // Position: rough estimate using textarea
      const textarea = textareaRef.current
      if (textarea) {
        const rect = textarea.getBoundingClientRect()
        setLinkDropdownPos({ top: rect.bottom + window.scrollY - 40, left: rect.left + 8 })
      }
    } else {
      setShowLinkDropdown(false)
    }
  }

  const insertNoteLink = (title) => {
    const el = textareaRef.current
    if (!el) return
    const cursorPos = el.selectionStart
    const content = el.value
    // Find [[... and replace with [[Title]]
    const before = content.slice(0, linkTriggerStart)
    const after = content.slice(cursorPos)
    const newContent = before + `[[${title}]]` + after
    update('content', newContent)
    setShowLinkDropdown(false)
    setTimeout(() => {
      el.focus()
      const pos = linkTriggerStart + title.length + 4
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  const filteredNotes = useMemo(() => {
    if (!linkQuery && !showLinkDropdown) return []
    return (allNotes || [])
      .filter((n) => n.title.toLowerCase().includes(linkQuery.toLowerCase()))
      .slice(0, 6)
  }, [linkQuery, allNotes, showLinkDropdown])

  // ── Smart keyboard handler ────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const el = textareaRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end, value } = el

    // ── Tab / Shift+Tab indent ──────────────────────────────────────────
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const before = value.slice(lineStart, start)
        const spaces = before.match(/^ {1,2}/)?.[0] ?? ''
        if (spaces) {
          const newVal = value.slice(0, lineStart) + value.slice(lineStart + spaces.length)
          update('content', newVal)
          setTimeout(() => el.setSelectionRange(start - spaces.length, end - spaces.length), 0)
        }
      } else {
        const newVal = value.slice(0, start) + '  ' + value.slice(end)
        update('content', newVal)
        setTimeout(() => el.setSelectionRange(start + 2, start + 2), 0)
      }
      return
    }

    // ── Enter: auto-continue list ───────────────────────────────────────
    if (e.key === 'Enter' && !e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const line = value.slice(lineStart, start)
      const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s(.*)/)
      if (listMatch) {
        e.preventDefault()
        const [, indent, marker, text] = listMatch
        if (text.trim() === '') {
          const newVal = value.slice(0, lineStart) + '\n' + value.slice(end)
          update('content', newVal)
          setTimeout(() => el.setSelectionRange(lineStart + 1, lineStart + 1), 0)
        } else {
          const nextMarker = /\d+/.test(marker) ? `${parseInt(marker) + 1}.` : marker
          const insert = `\n${indent}${nextMarker} `
          const newVal = value.slice(0, start) + insert + value.slice(end)
          update('content', newVal)
          const pos = start + insert.length
          setTimeout(() => el.setSelectionRange(pos, pos), 0)
        }
        return
      }
      const indentMatch = line.match(/^(\s+)/)
      if (indentMatch) {
        e.preventDefault()
        const insert = `\n${indentMatch[1]}`
        const newVal = value.slice(0, start) + insert + value.slice(end)
        update('content', newVal)
        const pos = start + insert.length
        setTimeout(() => el.setSelectionRange(pos, pos), 0)
        return
      }
    }

    // ── Auto-close brackets ─────────────────────────────────────────────
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" }
    if (pairs[e.key] && start === end) {
      e.preventDefault()
      const close = pairs[e.key]
      const newVal = value.slice(0, start) + e.key + close + value.slice(end)
      update('content', newVal)
      setTimeout(() => el.setSelectionRange(start + 1, start + 1), 0)
      return
    }

    const closers = new Set([')', ']', '}'])
    if (closers.has(e.key) && start === end && value[start] === e.key) {
      e.preventDefault()
      setTimeout(() => el.setSelectionRange(start + 1, start + 1), 0)
    }
  }

  const applyBold      = () => insertAtCursor('<strong>', '</strong>')
  const applyItalic    = () => insertAtCursor('<em>', '</em>')
  const applyUnderline = () => insertAtCursor('<u>', '</u>')
  const applyColor     = (color) => {
    if (!color) return insertAtCursor('<span>', '</span>')
    insertAtCursor(`<span style="color:${color}">`, '</span>')
  }
  const applySize = (tag) => {
    if (!tag) return
    insertAtCursor(`<${tag}>`, `</${tag}>`)
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  const fileInputRef = useRef(null)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const imgTag = `\n<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;border-radius:8px;" />\n`
      insertAtCursor(imgTag)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Template selection ────────────────────────────────────────────────────
  const applyTemplate = (tpl) => {
    setShowTemplates(false)
    if (values.content.trim()) {
      if (!window.confirm('This will replace your current content. Continue?')) return
    }
    update('content', tpl.content)
    if (!values.title) update('title', tpl.title)
  }

  // ── Find & Replace ────────────────────────────────────────────────────────
  const replaceNext = () => {
    if (!findText) return
    const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    let count = 0
    const newContent = values.content.replace(re, (match) => {
      count++
      if (count === matchIndex + 1) return replaceText
      return match
    })
    update('content', newContent)
    setMatchIndex((i) => (i + 1) % Math.max(1, matchCount))
  }

  const replaceAll = () => {
    if (!findText) return
    try {
      const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      update('content', values.content.replace(re, replaceText))
    } catch {}
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      const savedNote = await onSubmit(values)
      // Save version history snapshot
      if (savedNote?.id) saveSnapshot(savedNote.id, values)
      // Update streak
      updateStreak()
      // Clear draft
      clearDraft()
      burst()
      setSaved(true)
      setTimeout(() => navigate(`/notes/${savedNote.id}`), 900)
    } catch (err) {
      setSaveError(err.message || 'Failed to save note. Please try again.')
      setSaving(false)
    }
  }

  // ── Focus mode styles ─────────────────────────────────────────────────────
  const focusModeStyles = focusMode
    ? { position: 'fixed', inset: 0, zIndex: 50, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '1rem' }
    : {}

  return (
    <>
      <ConfettiCanvas canvasRef={canvasRef} />

      {/* Note Link Dropdown */}
      {showLinkDropdown && filteredNotes.length > 0 && (
        <div
          className="fixed z-50 w-64 rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
          style={{ top: linkDropdownPos.top, left: linkDropdownPos.left }}
        >
          {filteredNotes.map((n) => (
            <button
              key={n.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/10 transition first:rounded-t-xl last:rounded-b-xl"
              onMouseDown={(e) => { e.preventDefault(); insertNoteLink(n.title) }}
            >
              {n.title}
            </button>
          ))}
        </div>
      )}

      {/* Version History Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => setShowHistory(false)} />
          <div className="w-80 h-full bg-slate-950 border-l border-white/10 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="font-black text-white">Version History</p>
              <button className="icon-btn" onClick={() => setShowHistory(false)}><X size={16} /></button>
            </div>
            {previewSnapshot ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <button className="btn-ghost text-xs" onClick={() => setPreviewSnapshot(null)}>
                  <ArrowLeft size={14} /> Back to list
                </button>
                <p className="text-xs text-slate-500">{new Date(previewSnapshot.timestamp).toLocaleString()}</p>
                <h3 className="font-black text-white text-sm">{previewSnapshot.title}</h3>
                <div className="prose prose-invert max-w-none text-xs border border-white/10 rounded-xl p-3 max-h-96 overflow-y-auto">
                  <MarkdownPreview content={previewSnapshot.content} />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full text-xs"
                  onClick={() => {
                    if (window.confirm('Restore this version? Current content will be replaced.')) {
                      update('content', previewSnapshot.content)
                      update('title', previewSnapshot.title)
                      setShowHistory(false)
                      setPreviewSnapshot(null)
                    }
                  }}
                >
                  <RotateCcw size={14} /> Restore this version
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {snapshots.length === 0 ? (
                  <p className="text-slate-500 text-sm p-4">No history yet. Save the note to create a snapshot.</p>
                ) : (
                  snapshots.map((snap) => (
                    <button
                      key={snap.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 transition"
                      onClick={() => setPreviewSnapshot(snap)}
                    >
                      <p className="text-xs font-black text-white truncate">{snap.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(snap.timestamp).toLocaleString()}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus mode overlay */}
      {focusMode ? (
        <div style={focusModeStyles}>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Mode</span>
            <div className="flex gap-2">
              <button
                className={`btn-primary transition-all ${saved ? 'bg-emerald-500/20 text-emerald-300' : ''}`}
                type="button"
                disabled={saving || saved}
                onClick={submit}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save note'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setFocusMode(false)}>
                <Shrink size={16} /> Exit Focus
              </button>
            </div>
          </div>
          <input
            className="input text-base font-bold mb-3"
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Note title"
            required
          />
          <textarea
            ref={textareaRef}
            className="input flex-1 resize-none font-mono text-lg leading-8"
            value={values.content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Write here…"
            style={{ minHeight: 'calc(100vh - 140px)' }}
          />
        </div>
      ) : (
        <form className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={submit}>
          <section className="luxury-panel overflow-hidden rounded-2xl">
            {/* Draft banner */}
            {draftBanner && (
              <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <p className="text-xs font-semibold text-amber-300">You have an unsaved draft — restore it?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30"
                    onClick={() => {
                      const draft = loadDraft()
                      if (draft) {
                        setValues((v) => ({ ...v, title: draft.title || v.title, content: draft.content || v.content, tags: draft.tags || v.tags }))
                      }
                      setDraftBanner(false)
                    }}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-white"
                    onClick={() => { clearDraft(); setDraftBanner(false) }}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  className={`btn-ghost ${splitView ? 'opacity-40 cursor-not-allowed' : ''}`}
                  onClick={() => !splitView && setPreview((v) => !v)}
                  disabled={splitView}
                >
                  {preview ? <FileText size={16} /> : <Eye size={16} />}
                  {preview ? 'Editor' : 'Preview'}
                </button>
                <button
                  type="button"
                  className={`btn-ghost ${splitView ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : ''}`}
                  onClick={() => { setSplitView((v) => !v); setPreview(false) }}
                >
                  <SplitSquareHorizontal size={16} />
                  Split
                </button>
                {isEditing && (
                  <button type="button" className="btn-ghost" onClick={() => setShowHistory(true)}>
                    <History size={16} />
                    History
                  </button>
                )}
                <button type="button" className="icon-btn" title="Focus mode" onClick={() => setFocusMode(true)}>
                  <Expand size={16} />
                </button>
              </div>
              <button
                className={`btn-primary transition-all ${saved ? 'bg-emerald-500/20 text-emerald-300' : ''}`}
                type="submit"
                disabled={saving || saved}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save note'}
              </button>
            </div>

            {/* Toolbar */}
            {!preview && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
                <button type="button" className="icon-btn h-8 w-8" title="Bold" onClick={applyBold}>
                  <Bold size={14} />
                </button>
                <button type="button" className="icon-btn h-8 w-8" title="Italic" onClick={applyItalic}>
                  <Italic size={14} />
                </button>
                <button type="button" className="icon-btn h-8 w-8" title="Underline" onClick={applyUnderline}>
                  <Underline size={14} />
                </button>
                <button type="button" className="icon-btn h-8 w-8" title="Checklist" onClick={applyChecklist}>
                  <CheckSquare size={14} />
                </button>

                <div className="mx-1 h-5 w-px bg-white/15" />

                <div className="flex items-center gap-1">
                  <Type size={13} className="text-slate-500" />
                  <select
                    className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-200 outline-none focus:border-violet-400/50"
                    defaultValue=""
                    onChange={(e) => { applySize(e.target.value); e.target.value = '' }}
                  >
                    {FONT_SIZES.map(({ label, tag }) => (
                      <option key={tag} value={tag} hidden={tag === ''}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="mx-1 h-5 w-px bg-white/15" />

                <button type="button" className="icon-btn h-8 w-8" title="Heading" onClick={() => applySize('h2')}>
                  <Heading2 size={14} />
                </button>

                <div className="mx-1 h-5 w-px bg-white/15" />

                <div className="flex items-center gap-1">
                  {COLORS.map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      onClick={() => { setSelectedColor(value); applyColor(value) }}
                      className={`h-5 w-5 rounded-full border-2 transition ${
                        selectedColor === value ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ background: value || 'linear-gradient(135deg,#e2e8f0,#94a3b8)' }}
                    />
                  ))}
                  <input
                    type="color"
                    title="Custom color"
                    className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none"
                    onBlur={(e) => { setSelectedColor(e.target.value); applyColor(e.target.value) }}
                  />
                </div>

                <div className="mx-1 h-5 w-px bg-white/15" />

                <button
                  type="button"
                  className="icon-btn h-8 gap-1.5 px-2.5 text-xs font-semibold"
                  title="Insert image"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image size={14} /> Image
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleImageUpload} />

                <div className="mx-1 h-5 w-px bg-white/15" />

                {/* Templates dropdown */}
                <div className="relative" ref={templateRef}>
                  <button
                    type="button"
                    className="icon-btn h-8 gap-1.5 px-2.5 text-xs font-semibold"
                    onClick={() => setShowTemplates((v) => !v)}
                  >
                    <FileText size={14} /> Templates <ChevronDown size={11} />
                  </button>
                  {showTemplates && (
                    <div className="absolute left-0 top-10 z-20 w-44 rounded-xl border border-white/10 bg-slate-900 shadow-2xl py-1">
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                          onClick={() => applyTemplate(tpl)}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Find & Replace */}
            {showFindReplace && !preview && (
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-slate-900/60 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <input
                    className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-violet-400/50 w-36"
                    placeholder="Find…"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">{matchCount > 0 ? `${matchCount} match${matchCount !== 1 ? 'es' : ''}` : ''}</span>
                </div>
                <input
                  className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-violet-400/50 w-36"
                  placeholder="Replace…"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
                <button type="button" className="icon-btn h-7 px-2.5 text-xs font-semibold" onClick={replaceNext}>Replace</button>
                <button type="button" className="icon-btn h-7 px-2.5 text-xs font-semibold" onClick={replaceAll}>Replace All</button>
                <button type="button" className="icon-btn h-7 w-7" onClick={() => setShowFindReplace(false)}><X size={13} /></button>
              </div>
            )}

            {saveError && (
              <p className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300">
                {saveError}
              </p>
            )}

            <div className="space-y-4 p-4">
              <input
                className="input text-base font-bold"
                value={values.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Note title"
                required
              />

              {preview ? (
                <div className="min-h-[520px] rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                  <MarkdownPreview content={values.content} />
                </div>
              ) : splitView ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <textarea
                    ref={textareaRef}
                    className="input min-h-[520px] resize-y font-mono leading-7"
                    value={values.content}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={'Write here…\n\nType [[ to link a note.'}
                  />
                  <div className="min-h-[520px] rounded-2xl border border-white/10 bg-slate-950/45 p-5 overflow-y-auto">
                    <MarkdownPreview content={values.content} allNotes={allNotes} />
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  className="input min-h-[520px] resize-y font-mono leading-7"
                  value={values.content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={'Write here…\n\nUse the toolbar to format text, add colors, or insert images.\nYou can also write Markdown.\nType [[ to link a note.\n\n## Example\n- Idea\n- Task\n\n```js\nconsole.log("hello")\n```'}
                />
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="glass-card rounded-2xl p-4">
              <p className="mb-3 text-sm font-black text-white">Details</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</span>
                  <select className="input" value={values.category} onChange={(e) => update('category', e.target.value)}>
                    {categoryNames.map((cat) => <option key={cat}>{cat}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Tags</span>
                  <input
                    className="input"
                    value={values.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    placeholder="react, fix, idea"
                  />
                </label>

                {/* Cover Color */}
                <div>
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Cover color</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COVER_COLORS.map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        title={label}
                        onClick={() => update('coverColor', value)}
                        className={`h-6 w-6 rounded-full border-2 transition ${
                          values.coverColor === value ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                        }`}
                        style={{
                          background: value || 'linear-gradient(135deg,#334155,#1e293b)',
                          outline: value === '' && values.coverColor === '' ? '2px solid white' : undefined,
                          outlineOffset: '1px',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-violet-400"
                      checked={values.favorite}
                      onChange={(e) => update('favorite', e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-300">Favorite</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-sky-400"
                      checked={values.pinned}
                      onChange={(e) => update('pinned', e.target.checked)}
                    />
                    <span className="text-xs font-bold text-slate-300">Pinned</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <p className="mb-3 text-sm font-black text-white">Quick Category</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(({ name, icon: Icon, color, glow }) => (
                  <button
                    key={name}
                    type="button"
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs font-bold transition ${
                      values.category === name
                        ? 'border-sky-300/40 bg-sky-300/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                    onClick={() => update('category', name)}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${glow} ${color}`}>
                      <Icon size={14} />
                    </span>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live stats */}
            <div className="glass-card rounded-2xl p-4">
              <p className="mb-2 text-sm font-black text-white">Live Stats</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Words</span>
                  <span className="font-black text-sky-300">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Characters</span>
                  <span className="font-black text-violet-300">{charCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Read time</span>
                  <span className="font-black text-emerald-300">~{Math.max(1, Math.ceil(wordCount / 200))} min</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">Tab</kbd> indent &nbsp;
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">Shift+Tab</kbd> unindent<br />
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">Enter</kbd> auto-list &nbsp;
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">Ctrl+H</kbd> find/replace
              </p>
            </div>
          </aside>
        </form>
      )}
    </>
  )
}
