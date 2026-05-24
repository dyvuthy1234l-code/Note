import { Download, Moon, RotateCcw, Sun, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useNotes } from '../context/NotesContext'

export default function Settings() {
  const { notes, settings, setSettings, resetWorkspace, importNotes } = useNotes()
  const fileRef = useRef(null)
  const [importMsg, setImportMsg] = useState('')

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify({ notes, settings }, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = 'mydevwiki-notes.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const importedNotes = parsed.notes ?? (Array.isArray(parsed) ? parsed : [])
        if (!importedNotes.length) { setImportMsg('No notes found in file.'); return }
        const added = importNotes(importedNotes)
        setImportMsg(`✓ Imported ${added} new note${added !== 1 ? 's' : ''} successfully!`)
      } catch {
        setImportMsg('✗ Invalid file. Please use a MyDevWiki JSON export.')
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Tune the feel of the app, import or export your notes. All data lives in your browser."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        {/* Appearance */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xl font-black text-white">Appearance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Choose the theme that feels best while writing.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ['dark', Moon, 'Dark'],
              ['light', Sun, 'Light'],
            ].map(([theme, Icon, label]) => (
              <button
                key={theme}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  settings.theme === theme
                    ? 'border-sky-300/40 bg-sky-300/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
                onClick={() => setSettings((c) => ({ ...c, theme }))}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xl font-black text-white">Data</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            All notes are stored in your browser's localStorage. Export regularly as backup.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={exportNotes}>
              <Download size={16} />
              Export JSON
            </button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} />
              Import JSON
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              className="btn-ghost text-rose-200 hover:bg-rose-500/10"
              onClick={() => {
                if (window.confirm('Reset workspace? This will delete all your notes.')) resetWorkspace()
              }}
            >
              <RotateCcw size={16} />
              Reset workspace
            </button>
          </div>
          {importMsg && (
            <p className={`mt-3 rounded-xl border px-4 py-2 text-sm font-semibold ${
              importMsg.startsWith('✓')
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            }`}>
              {importMsg}
            </p>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-white">Keyboard Shortcuts</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Speed up your workflow with these global shortcuts.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ['Ctrl + N', 'New note'],
              ['Ctrl + D', 'Dashboard'],
              ['Ctrl + K', 'Focus search'],
            ].map(([keys, action]) => (
              <div key={keys} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-semibold text-slate-300">{action}</span>
                <kbd className="rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-300">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Storage info */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-white">Storage</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-black text-sky-300">{notes.length}</p>
              <p className="mt-1 text-sm text-slate-400">Total notes</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-black text-violet-300">
                {(new Blob([JSON.stringify(notes)]).size / 1024).toFixed(1)} KB
              </p>
              <p className="mt-1 text-sm text-slate-400">Notes size</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-black text-emerald-300">localStorage</p>
              <p className="mt-1 text-sm text-slate-400">Storage type</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
