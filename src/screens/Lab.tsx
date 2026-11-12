import { X } from 'lucide-react'
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from 'motion/react'
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { CardBack, CardFront, type Face } from '../components/CardFaces'
import { GestureHint } from '../components/GestureHint'
import { breakCards, BREAK_COLOR, craft, CRAFT_ORDER, spark, SPARK_ORDER, type CraftKey } from '../lib/content'
import { buzz } from '../lib/haptics'
import { MODES } from '../lib/modes'
import { pickNoRepeat, seedPhrase } from '../lib/rules'

/**
 * Prototipo «mazo en la mano» (#/lab). Solo para probar la sensación:
 * no guarda nada en el historial ni en el contador.
 * shortcut: sin Tip Day ni Y SI…, añadir si la propuesta se adopta.
 */
const LAB_MODES = ['spark', 'craft', 'break'] as const
const CW = 236
const CH = 334
const FLIP = [0.3, 0.85, 0.25, 1] as const
const BACK = [0.2, 1.3, 0.4, 1] as const

export function Lab() {
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 402, h: 874 })
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Carta grande: ~84 % del ancho, y el mazo asoma desde abajo como sujeto en la mano.
  const s = Math.min((size.w * 0.84) / CW, (size.h * 0.56) / CH)
  const W = CW * s
  const H = CH * s
  const left = (size.w - W) / 2
  const deckTop = size.h * 0.6
  const drawnTop = Math.max(size.h * 0.13, 104)
  const D = drawnTop - deckTop

  const [mi, setMi] = useState(0)
  const mode = LAB_MODES[mi]
  const m = MODES[mode]
  const [cat, setCat] = useState<CraftKey>('PERSONAJE')
  const [face, setFace] = useState<Face | null>(null)
  const [drawn, setDrawn] = useState(false)
  const [sparkRun, setSparkRun] = useState<Face[]>([])
  const prev = useRef<Record<string, string>>({})
  const busy = useRef(false)
  const moved = useRef(false)
  const off = useRef({ x: 0, y: 0 })

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const opacity = useMotionValue(1)

  const seedReady = mode === 'spark' && sparkRun.length === 3
  const backLabel = mode === 'spark' ? (seedReady ? 'Frase-semilla' : `${sparkRun.length}/3`) : mode === 'craft' ? craft[cat].name : m.mech

  function nextFace(): Face {
    if (mode === 'break') {
      const text = pickNoRepeat(breakCards, prev.current.break)
      prev.current.break = text
      return { label: 'BREAK', color: BREAK_COLOR, text }
    }
    if (mode === 'craft') {
      const d = craft[cat]
      const text = pickNoRepeat(d.items, prev.current[cat])
      prev.current[cat] = text
      return { label: d.name.toUpperCase(), color: d.color, text }
    }
    if (seedReady) return { label: 'Frase-semilla', color: '#FFFFFF', text: seedPhrase(sparkRun[0].text, sparkRun[1].text, sparkRun[2].text) }
    const k = SPARK_ORDER[sparkRun.length]
    const d = spark[k]
    const text = pickNoRepeat(d.items, prev.current[k])
    prev.current[k] = text
    return { label: k === 'QUIEN' ? 'PROTAGONISTA' : d.name, color: d.color, text }
  }

  const t = (o: object) => (reduce ? { duration: 0 } : o)

  async function draw() {
    if (busy.current || drawn) return
    busy.current = true
    buzz(16)
    const f = nextFace()
    setFace(f)
    if (mode === 'spark' && !seedReady) setSparkRun((r) => [...r, f])
    await Promise.all([
      animate(y, reduce ? D : [y.get(), D - 60, D], t({ duration: 0.85, times: [0, 0.45, 1], ease: ['easeOut', BACK] })),
      animate(x, 0, t({ duration: 0.5 })),
      animate(rotate, 0, t({ duration: 0.5 })),
      animate(rotateY, 180, t({ duration: 0.72, delay: 0.12, ease: FLIP })),
    ])
    buzz(20)
    setDrawn(true)
    busy.current = false
  }

  async function dismiss(dx = 0, dy = -1) {
    if (busy.current || !drawn) return
    busy.current = true
    buzz(8)
    const len = Math.hypot(dx, dy) || 1
    await Promise.all([
      animate(x, (dx / len) * size.w * 1.2, t({ duration: 0.35, ease: 'easeIn' })),
      animate(y, D + (dy / len) * size.h, t({ duration: 0.35, ease: 'easeIn' })),
      animate(opacity, 0, t({ duration: 0.35 })),
    ])
    if (face?.label === 'Frase-semilla') setSparkRun([])
    setDrawn(false)
    x.set(0)
    y.set(0)
    rotate.set(0)
    rotateY.set(0)
    animate(opacity, 1, t({ duration: 0.2 }))
    busy.current = false
  }

  async function switchMode(dir: 1 | -1) {
    if (busy.current || drawn) return
    const next = mi + dir
    if (next < 0 || next >= LAB_MODES.length) return springBack()
    busy.current = true
    buzz(8)
    await animate(x, -dir * size.w, t({ duration: 0.22, ease: 'easeIn' }))
    setMi(next)
    rotate.set(0)
    y.set(0)
    x.set(dir * size.w)
    await animate(x, 0, t({ duration: 0.4, ease: BACK }))
    busy.current = false
  }

  function springBack() {
    animate(x, 0, t({ duration: 0.44, ease: BACK }))
    animate(y, drawn ? D : 0, t({ duration: 0.44, ease: BACK }))
    animate(rotate, 0, t({ duration: 0.44, ease: BACK }))
  }

  function onPan(_: PointerEvent, info: PanInfo) {
    if (busy.current) return
    moved.current = true
    off.current = info.offset
    if (drawn) {
      x.set(info.offset.x)
      y.set(D + info.offset.y)
      rotate.set(info.offset.x * 0.04)
    } else {
      x.set(info.offset.x * 0.55)
      y.set(Math.min(0, info.offset.y))
      rotate.set(info.offset.x * 0.035)
    }
  }
  function onPanEnd() {
    if (busy.current) return
    const o = off.current
    if (drawn) return Math.hypot(o.x, o.y) > 90 ? dismiss(o.x, o.y) : springBack()
    if (y.get() < -90) return draw()
    if (Math.abs(o.x) > 80 && Math.abs(o.y) < 60) return switchMode(o.x < 0 ? 1 : -1)
    springBack()
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (drawn) dismiss()
      else draw()
    } else if (!drawn && e.key === 'ArrowRight') switchMode(1)
    else if (!drawn && e.key === 'ArrowLeft') switchMode(-1)
  }

  const scaled = { width: CW, height: CH, transform: `scale(${s})`, transformOrigin: '0 0' }

  return (
    <div ref={root} className="relative h-full overflow-hidden bg-surface" style={{ touchAction: 'none' }}>
      {/* Barra mínima */}
      <div className="absolute inset-x-0 top-0 z-30 px-[22px]" style={{ paddingTop: 'calc(var(--sat) + 14px)' }}>
        <div className="flex items-center justify-between">
          <span className="font-display text-[13px] font-extrabold uppercase tracking-[-0.02em]">
            Story Deck<sup className="ml-0.5 text-[8px] font-bold text-blue">®</sup>
          </span>
          <Link to="/" aria-label="Salir del prototipo" className="flex size-8 items-center justify-center border border-ink/20 hover:border-ink">
            <X size={15} aria-hidden />
          </Link>
        </div>
        <div role="tablist" aria-label="Mazo" className="mt-4 flex justify-center gap-6">
          {LAB_MODES.map((k, i) => (
            <button
              key={k}
              role="tab"
              aria-selected={i === mi}
              onClick={() => i !== mi && switchMode(i > mi ? 1 : -1)}
              className={`t-ui relative pb-2 text-[11px] transition-colors ${i === mi ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-blue' : 'text-muted3'}`}
            >
              {MODES[k].title}
            </button>
          ))}
        </div>
        {mode === 'craft' && !drawn && (
          <div className="anim-fade-in mt-3 flex justify-center gap-1">
            {CRAFT_ORDER.map((k) => (
              <button key={k} onClick={() => setCat(k)} aria-pressed={k === cat} className={`t-ui px-2 py-1.5 text-[8.5px] tracking-[0.06em] transition-colors ${k === cat ? 'bg-ink text-surface' : 'text-muted2 hover:text-ink'}`}>
                {craft[k].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spark: las cartas ya robadas, en miniatura, esperando la frase */}
      {mode === 'spark' && !drawn && sparkRun.length > 0 && (
        <div aria-hidden className="absolute inset-x-0 flex justify-center gap-3" style={{ top: drawnTop + 40 }}>
          {SPARK_ORDER.map((k, i) => (
            <div key={k} className="relative" style={{ width: CW * 0.32, height: CH * 0.32 }}>
              {sparkRun[i] ? (
                <div className="anim-bounce-in" style={{ width: CW, height: CH, transform: 'scale(.32)', transformOrigin: '0 0', position: 'relative' }}>
                  <CardBack color={sparkRun[i].color} title="" label={sparkRun[i].label} titleSize={0} />
                </div>
              ) : (
                <div className="size-full" style={{ borderRadius: 6, border: '1.5px dashed rgba(23,21,15,.2)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {!drawn && (
        <div className="absolute inset-x-0 flex justify-center" style={{ top: deckTop - 72 }}>
          <GestureHint color={m.color} />
        </div>
      )}

      {/* El mazo en la mano: capas abiertas en abanico desde abajo */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute"
          style={{ left, top: deckTop, width: W, height: H, transform: `rotate(${(i % 2 ? 1 : -1) * (6 - i) * 1.2}deg) translateY(${(6 - i) * 1.5}px)`, transformOrigin: '50% 100%' }}
        >
          <div className="card-face" style={{ background: m.color, transition: 'background .3s', ['--r' as string]: `${18 * s}px`, boxShadow: '0 10px 24px rgba(23,21,15,.14), inset 0 0 0 2px #fff' } as React.CSSProperties} />
        </div>
      ))}

      <motion.div
        role="button"
        tabIndex={0}
        aria-label={drawn && face ? `${face.label}. ${face.text}. Pulsa para soltarla` : `Mazo de ${m.title}, roba una carta. Flechas para cambiar de mazo`}
        onPointerDown={() => (moved.current = false)}
        onClick={() => !moved.current && (drawn ? dismiss() : draw())}
        onKeyDown={onKeyDown}
        onPan={onPan}
        onPanEnd={onPanEnd}
        className="absolute z-20 outline-offset-4"
        style={{ left, top: deckTop, width: W, height: H, x, y, rotate, opacity, perspective: 1400, touchAction: 'none', cursor: 'grab' }}
      >
        <motion.div className="relative size-full" style={{ rotateY, transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <div style={scaled}>
              <CardBack color={m.color} title={m.title} label={backLabel} titleSize={34} />
            </div>
          </div>
          <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            {face && (
              <div style={scaled}>
                <CardFront face={face} pad={24} hidden={!drawn} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
