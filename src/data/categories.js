import { Briefcase, Bug, CircleHelp, Code2, Database, FileCode2, Hexagon, Server } from 'lucide-react'

export const categories = [
  { name: 'JavaScript', icon: FileCode2, color: 'text-yellow-300', glow: 'bg-yellow-300/10' },
  { name: 'React', icon: Code2, color: 'text-sky-300', glow: 'bg-sky-300/10' },
  { name: 'PHP', icon: Hexagon, color: 'text-violet-300', glow: 'bg-violet-300/10' },
  { name: 'Node.js', icon: Server, color: 'text-emerald-300', glow: 'bg-emerald-300/10' },
  { name: 'Database', icon: Database, color: 'text-cyan-300', glow: 'bg-cyan-300/10' },
  { name: 'Internship', icon: Briefcase, color: 'text-blue-300', glow: 'bg-blue-300/10' },
  { name: 'Errors', icon: Bug, color: 'text-rose-300', glow: 'bg-rose-300/10' },
  { name: 'Other', icon: CircleHelp, color: 'text-slate-300', glow: 'bg-slate-300/10' },
]

export const categoryNames = categories.map((category) => category.name)

export function getCategoryMeta(name) {
  return categories.find((category) => category.name === name) ?? categories[0]
}
