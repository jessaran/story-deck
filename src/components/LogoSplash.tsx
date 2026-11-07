import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type PointerEvent } from 'react'
import logo from '../assets/logo.webp'
import { buzz } from '../lib/haptics'
import { isDiagonalCut, splitRect, toClipPath, type Pt } from '../lib/slice'

const RATIO = 658 / 720 // alto / ancho del logo
type Cut = { left: string; right: string; normal: Pt; a: Pt; b: Pt }

/** Pantalla de entrada: el logo se corta con un swipe diagonal, al estilo de los juegos de cortar fruta. */
export function LogoSplash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const start = useRef<Pt | null>(null)
  const [trail, setTrail] = useState<Pt[]>([])
  const [cut, setCut] = useState<Cut | null>(null)

  const local = (e: PointerEvent): Pt => {
    const r = box.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function slice(a: Pt, b: Pt) {
    const el = box.current
    if (!el || cut) return false
    const w = el.offsetWidth
    const h = el.offsetHeight
    const s = splitRect(w, h, a, b)
    const area = (p: Pt[]) => Math.abs(p.reduce((n, q, i) => n + q.x * p[(i + 1) % p.length].y - p[(i + 1) % p.length].x * q.y, 0)) / 2
    // La recta tiene que atravesar el logo, no rozar una esquina.
    if (Math.min(area(s.left), area(s.right)) < w * h * 0.12) return false
    buzz(24)
    setCut({ left: toClipPath(s.left, w, h), right: toClipPath(s.right, w, h), normal: s.normal, a, b })
    window.setTimeout(onDone, reduce ? 250 : 1050)
    return true
  }

  function onDown(e: PointerEvent) {
    if (cut) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    start.current = local(e)
    setTrail([start.current])
  }
  function onMove(e: PointerEvent) {
    if (!start.current || cut) return
    const p = local(e)
    setTrail((t) => [...t.slice(-14), p])
    const w = box.current!.offsetWidth
    if (isDiagonalCut(start.current, p, w * 0.45) && slice(start.current, p)) start.current = null
  }
  function onUp() {
    start.current = null
    setTrail([])
  }

  // Recta del corte prolongada más allá del logo, para el destello de la hoja.
  const blade = cut && (() => {
    const dx = cut.b.x - cut.a.x
    const dy = cut.b.y - cut.a.y
    const k = 1000 / (Math.hypot(dx, dy) || 1)
    return { x1: cut.a.x - dx * k, y1: cut.a.y - dy * k, x2: cut.b.x + dx * k, y2: cut.b.y + dy * k }
  })()

  const half = (clip: string, dir: 1 | -1) => (
    <motion.img
      src={logo}
      alt=""
      draggable={false}
      className="absolute inset-0 size-full"
      style={{ clipPath: clip, WebkitClipPath: clip }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
      animate={
        reduce
          ? { opacity: 0 }
          : { x: dir * cut!.normal.x * 80, y: [0, dir * cut!.normal.y * 50 - 30, 420], rotate: dir * 14, opacity: [1, 1, 0] }
      }
      transition={reduce ? { duration: 0.2 } : { duration: 1, delay: 0.08, ease: [0.35, 0, 0.6, 1], times: [0, 0.3, 1] }}
    />
  )

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-6"
      style={{ touchAction: 'none', paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div ref={box} className="relative w-full max-w-[340px]" style={{ aspectRatio: `${1 / RATIO}` }}>
        {cut ? (
          <>
            {half(cut.left, 1)}
            {half(cut.right, -1)}
            {blade && !reduce && (
              <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
                <motion.line {...blade} stroke="#1E32D8" strokeWidth={10} strokeLinecap="round" initial={{ pathLength: 0, opacity: 0.5 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ duration: 0.4 }} style={{ filter: 'blur(4px)' }} />
                <motion.line {...blade} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ duration: 0.4 }} />
              </svg>
            )}
          </>
        ) : (
          <img src={logo} alt="Story Deck" draggable={false} className="anim-fade-in absolute inset-0 size-full" />
        )}
        {trail.length > 1 && !cut && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#1E32D8" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
          </svg>
        )}
      </div>

      <motion.button
        type="button"
        onClick={() => {
          const el = box.current
          if (el) slice({ x: el.offsetWidth * 0.12, y: el.offsetHeight * 0.18 }, { x: el.offsetWidth * 0.88, y: el.offsetHeight * 0.82 })
        }}
        animate={{ opacity: cut ? 0 : 1 }}
        className="mt-10 flex flex-col items-center gap-3"
        aria-label="Corta el logo para empezar"
      >
        <svg aria-hidden width="64" height="44" viewBox="0 0 64 44" className="overflow-visible">
          <line x1="6" y1="6" x2="58" y2="38" stroke="rgba(23,21,15,.15)" strokeWidth="2" strokeDasharray="3 4" />
          <line className="anim-slash-hint" x1="6" y1="6" x2="58" y2="38" stroke="#1E32D8" strokeWidth="3" strokeLinecap="round" pathLength={1} />
        </svg>
        <span className="t-label">Corta el logo en diagonal</span>
      </motion.button>
    </div>
  )
}
