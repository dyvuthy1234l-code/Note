export const sampleNotes = [
  {
    id: crypto.randomUUID(),
    title: 'React useEffect cleanup pattern',
    category: 'React',
    tags: ['hooks', 'frontend', 'cleanup'],
    content:
      'Use cleanup when a subscription, timer, listener, or pending async result can outlive the component.\n\n```jsx\nuseEffect(() => {\n  const controller = new AbortController()\n\n  fetch(url, { signal: controller.signal })\n    .then((res) => res.json())\n    .then(setData)\n\n  return () => controller.abort()\n}, [url])\n```\n\nFavorite this note when reviewing component lifecycle behavior.',
    favorite: true,
    pinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Common Git commands for internship work',
    category: 'Internship',
    tags: ['git', 'teamwork', 'commands'],
    content:
      'Daily flow for small tasks:\n\n```bash\ngit switch -c feature/task-name\ngit status\ngit add src/components/Button.jsx\ngit commit -m "Add reusable button"\ngit push origin feature/task-name\n```\n\nAlways pull recent changes before starting a new branch.',
    favorite: false,
    pinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Fix: Vite port already in use',
    category: 'Errors',
    tags: ['vite', 'debugging', 'fix'],
    content:
      'When Vite says the port is already in use, either close the running terminal or choose another port.\n\n```bash\nnpm run dev -- --port 5174\n```\n\nThis keeps work moving during demos or internship standups.',
    favorite: true,
    pinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
]
