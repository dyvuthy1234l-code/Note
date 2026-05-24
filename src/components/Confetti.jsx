import { useEffect, useRef } from 'react'

const COLORS = ['#7dd3fc', '#a78bfa', '#f9a8d4', '#6ee7b7', '#fde68a', '#c4b5fd']

function randomBetween(a, b) { return a + Math.random() * (b - a) }

export function useConfetti() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  const burst = () => {
    const canvas  = canvasRef.current
    if (!canvas) return
    const ctx     = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 120 }, () => ({
      x:    randomBetween(0, canvas.width),
      y:    randomBetween(-40, -10),
      vx:   randomBetween(-2, 2),
      vy:   randomBetween(2, 6),
      r:    randomBetween(4, 9),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.1, 0.1),
      opacity: 1,
    }))

    let start = null
    const DURATION = 2200

    const tick = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x        += p.vx
        p.y        += p.vy
        p.vy       += 0.12            // gravity
        p.rotation += p.rotationSpeed
        p.opacity   = Math.max(0, 1 - elapsed / DURATION)

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5)
        ctx.restore()
      })

      if (elapsed < DURATION) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  return { canvasRef, burst }
}

export function ConfettiCanvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
