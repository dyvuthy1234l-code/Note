import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

function CodeBlock({ className, children, ...props }) {
  const [copied, setCopied] = useState(false)
  const isInline = !className
  const code = String(children).replace(/\n$/, '')

  if (isInline) {
    return (
      <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-sky-200" {...props}>
        {children}
      </code>
    )
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="not-prose my-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {className?.replace('language-', '') || 'code'}
        </span>
        <button
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={copyCode}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

// Render [[Note Title]] as an internal link
function processNotLinks(content) {
  return content
}

function NoteLinkText({ children }) {
  const navigate = useNavigate()
  // We render plain text nodes, intercepting [[...]] patterns
  if (typeof children !== 'string') return children
  const parts = children.split(/(\[\[[^\]]+\]\])/g)
  if (parts.length === 1) return children
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[(.+)\]\]$/)
        if (match) {
          return (
            <a
              key={i}
              className="note-internal-link cursor-pointer rounded-md border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 text-violet-300 no-underline transition hover:bg-violet-500/20 hover:text-violet-200"
              onClick={(e) => {
                e.preventDefault()
                // Navigate to search for that note title
                navigate(`/notes?search=${encodeURIComponent(match[1])}`)
              }}
            >
              🔗 {match[1]}
            </a>
          )
        }
        return part
      })}
    </>
  )
}

// Pre-process content to replace [[Note Title]] before markdown parsing
function preprocessContent(content) {
  // We'll handle it at the component level instead
  return content
}

export default function MarkdownPreview({ content }) {
  // Replace [[Note Title]] with a custom marker that survives markdown
  // We inject them as raw HTML spans for rehype-raw to handle
  const processedContent = (content || '').replace(
    /\[\[([^\]]+)\]\]/g,
    (_, title) => `<note-link data-title="${title.replace(/"/g, '&quot;')}">${title}</note-link>`
  )

  return (
    <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-sky-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code: CodeBlock,
          img: ({ alt, ...props }) => (
            <img
              className="max-h-[520px] rounded-2xl border border-white/10 object-contain"
              alt={alt ?? ''}
              {...props}
            />
          ),
          'note-link': ({ node, ...props }) => {
            const title = node?.properties?.datTitle || props['data-title'] || ''
            return (
              <a
                href={`/notes?search=${encodeURIComponent(title)}`}
                className="note-internal-link inline-flex items-center gap-1 rounded-md border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 font-semibold text-violet-300 no-underline transition hover:bg-violet-500/20 hover:text-violet-200"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/notes?search=${encodeURIComponent(title)}`
                }}
              >
                🔗 {title}
              </a>
            )
          },
        }}
      >
        {processedContent || 'Start writing to preview your note.'}
      </ReactMarkdown>
    </div>
  )
}
