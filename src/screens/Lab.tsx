import { X } from 'lucide-react'
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue, type PanInfo } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { CardBack, type Face } from '../components/CardFaces'
import { GestureHint } from '../components/GestureHint'
import { Mascot } from '../components/Mascot'
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
const LAYERS = 5
// Muelles con algo de rebote: el tacto «de papel» de la referencia.
const SNAP = { type: 'spring', stiffness: 260, damping: 22 } as const
const WOBBLE = { type: 'spring', stiffness: 190, damping: 10 } as const
const FLIP = { type: 'spring', stiffness: 120, damping: 15 } as const

type Phase = 'deck' | 'drawing' | 'open'
type LabFace = Face & { seed?: Face[] }
const tilts = () => Array.from({ length: LAYERS }, (_, i) => (Math.random() - 0.5) * (4 + i * 2.2))
const fullSize = (L: number) => (L > 190 ? 28 : L > 150 ? 31 : L > 110 ? 35 : L > 75 ? 40 : 46)

/** Una carta del mazo de debajo: sigue al dedo con retraso de muelle, como un taco de papel suelto. */
function Layer({ i, tilt, dx, dy, jump, style, color }: { i: number; tilt: number; dx: MotionValue<number>; dy: MotionValue<number>; jump: number; style: React.CSSProperties; color: string }) {
  const t = useMotionValue(tilt)
  const depth = (LAYERS - i) / LAYERS
  const rotate = useSpring(useTransform([dx, t], ([x, b]: number[]) => b + x * 0.03 * depth), WOBBLE)
  const x = useSpring(useTransform(dx, (v) => v * (0.5 + 0.4 * (1 - depth))), { stiffness: 220, damping: 18 })
  const y = useSpring(useTransform(dy, (v) => v * 0.06 * (1 - depth)), WOBBLE)
  useEffect(() => t.set(tilt), [tilt, t])
  useEffect(() => {
    if (jump) x.jump(dx.get() * (0.5 + 0.4 * (1 - depth)))
  }, [jump]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <motion.div aria-hidden className="absolute" style={{ ...style, rotate, x, y, transformOrigin: '50% 100%' }}>
      <div className="card-face" style={{ background: color, transition: 'background .3s', ['--r' as string]: '22px', boxShadow: '0 10px 24px rgba(23,21,15,.14), inset 0 0 0 2px #fff' } as React.CSSProperties} />
    </motion.div>
  )
}

export function Lab() {
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 402, h: 874, sat: 0, sab: 0 })
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight, sat: probe.current?.offsetTop ?? 0, sab: probe.current?.offsetHeight ?? 0 })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Mazo grande que asoma desde abajo; al robar, la carta ocupa toda la pantalla.
  const s = Math.min((size.w * 0.84) / CW, (size.h * 0.56) / CH)
  const W = CW * s
  const H = CH * s
  const rest = { x: (size.w - W) / 2, y: size.h * 0.6, w: W, h: H }
  const full = { x: 10, y: size.sat + 10, w: size.w - 20, h: size.h - size.sat - size.sab - 20 }

  const [mi, setMi] = useState(0)
  const mode = LAB_MODES[mi]
  const m = MODES[mode]
  const [cat, setCat] = useState<CraftKey>('PERSONAJE')
  const [face, setFace] = useState<LabFace | null>(null)
  const [phase, setPhase] = useState<Phase>('deck')
  const [bubble, setBubble] = useState(false)
  const [sparkRun, setSparkRun] = useState<Face[]>([])
  const [layerTilts, setLayerTilts] = useState(tilts)
  const [jump, setJump] = useState(0)
  const prev = useRef<Record<string, string>>({})
  const busy = useRef(false)
  const moved = useRef(false)
  const topTilt = useRef((Math.random() - 0.5) * 3)

  // Posición base (mazo o pantalla completa) + desplazamiento del dedo.
  const px = useMotionValue(rest.x)
  const py = useMotionValue(rest.y)
  const dx = useMotionValue(0)
  const dy = useMotionValue(0)
  const w = useMotionValue(W)
  const h = useMotionValue(H)
  const x = useTransform([px, dx], ([a, b]: number[]) => a + b)
  const y = useTransform([py, dy], ([a, b]: number[]) => a + b)
  const rotate = useMotionValue(topTilt.current)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)
  const opacity = useMotionValue(1)

  useLayoutEffect(() => {
    if (busy.current) return
    const r = phase === 'open' ? full : rest
    px.set(r.x)
    py.set(r.y)
    w.set(r.w)
    h.set(r.h)
  }, [size]) // eslint-disable-line react-hooks/exhaustive-deps

  const seedReady = mode === 'spark' && sparkRun.length === 3
  const backLabel = mode === 'spark' ? (seedReady ? 'Frase-semilla' : `${sparkRun.length}/3`) : mode === 'craft' ? craft[cat].name : m.mech
  const go = <T,>(o: T) => (reduce ? { duration: 0 } : o)
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms))

  function nextFace(): LabFace {
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
    if (seedReady) return { label: 'Frase-semilla', color: '#FFFFFF', text: seedPhrase(sparkRun[0].text, sparkRun[1].text, sparkRun[2].text), seed: sparkRun }
    const k = SPARK_ORDER[sparkRun.length]
    const d = spark[k]
    const text = pickNoRepeat(d.items, prev.current[k])
    prev.current[k] = text
    return { label: k === 'QUIEN' ? 'PROTAGONISTA' : d.name, color: d.color, text }
  }

  async function draw() {
    if (busy.current || phase !== 'deck') return
    busy.current = true
    buzz(16)
    const f = nextFace()
    setFace(f)
    setPhase('drawing')
    if (mode === 'spark' && !seedReady) setSparkRun((r) => [...r, f])
    const kick = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 3)
    animate(dx, 0, go(SNAP))
    animate(dy, 0, go(SNAP))
    animate(px, full.x, go(SNAP))
    animate(py, full.y, go({ type: 'spring', stiffness: 200, damping: 21 }))
    animate(w, full.w, go(SNAP))
    animate(h, full.h, go(SNAP))
    animate(scale, 1, go(SNAP))
    animate(rotateY, 180, go(FLIP))
    // Un pequeño giro en el aire y se asienta con rebote.
    animate(rotate, kick, go({ duration: 0.22, ease: 'easeOut' })).then(() => animate(rotate, 0, go(WOBBLE)))
    setLayerTilts(tilts())
    await wait(520)
    buzz(20)
    setPhase('open')
    busy.current = false
  }

  async function dismiss(vx = 0, vy = -1) {
    if (busy.current || phase !== 'open') return
    busy.current = true
    setBubble(false)
    buzz(8)
    const len = Math.hypot(vx, vy) || 1
    const ux = vx / len
    const uy = vy / len
    animate(px, px.get() + ux * size.w * 1.4, go({ duration: 0.38, ease: 'easeIn' }))
    animate(py, py.get() + uy * size.h * 1.1, go({ duration: 0.38, ease: 'easeIn' }))
    animate(rotate, rotate.get() + (ux || 0.4) * 28, go({ duration: 0.38, ease: 'easeIn' }))
    // Temporizador y no la promesa de la animación: si la pestaña se oculta, la animación se congela.
    await wait(380)
    if (face?.seed) setSparkRun([])
    // La siguiente carta entra desde abajo y se coloca encima del mazo.
    topTilt.current = (Math.random() - 0.5) * 3
    rotateY.jump(0)
    scale.jump(1)
    px.jump(rest.x)
    py.jump(rest.y)
    w.jump(rest.w)
    h.jump(rest.h)
    dx.jump(0)
    dy.jump(size.h * 0.5)
    rotate.jump(topTilt.current * 3)
    opacity.jump(1)
    setPhase('deck')
    setLayerTilts(tilts())
    animate(dy, 0, go(SNAP))
    animate(rotate, topTilt.current, go(WOBBLE))
    // No esperamos a que el muelle se asiente: se puede robar mientras aún rebota.
    await wait(260)
    busy.current = false
  }

  async function switchMode(dir: 1 | -1) {
    if (busy.current || phase !== 'deck') return
    const next = mi + dir
    if (next < 0 || next >= LAB_MODES.length) return springBack()
    busy.current = true
    buzz(8)
    animate(dx, -dir * size.w, go({ duration: 0.22, ease: 'easeIn' }))
    animate(rotate, -dir * 14, go({ duration: 0.22 }))
    await wait(220)
    setMi(next)
    topTilt.current = (Math.random() - 0.5) * 3
    dx.jump(dir * size.w)
    dy.jump(0)
    rotate.jump(dir * 12)
    setJump((n) => n + 1)
    setLayerTilts(tilts())
    animate(dx, 0, go(SNAP))
    animate(rotate, topTilt.current, go(WOBBLE))
    await wait(260)
    busy.current = false
  }

  function springBack() {
    if (phase === 'open') {
      animate(px, full.x, go(WOBBLE))
      animate(py, full.y, go(WOBBLE))
    }
    animate(dx, 0, go(WOBBLE))
    animate(dy, 0, go(WOBBLE))
    animate(scale, 1, go(SNAP))
    animate(rotate, phase === 'open' ? 0 : topTilt.current, go(WOBBLE))
  }

  function onPan(_: PointerEvent, info: PanInfo) {
    if (busy.current) return
    moved.current = true
    const o = info.offset
    // Abierta, la carta se mueve sola (px/py); dx/dy arrastran también el mazo de debajo.
    if (phase === 'open') {
      px.set(full.x + o.x)
      py.set(full.y + o.y)
      rotate.set(o.x * 0.05)
      scale.set(1 - Math.min(0.1, Math.hypot(o.x, o.y) / 1600))
    } else {
      dx.set(o.x * 0.55)
      dy.set(o.y < 0 ? o.y : o.y * 0.15)
      rotate.set(topTilt.current + o.x * 0.04)
    }
  }
  function onPanEnd(_: PointerEvent, info: PanInfo) {
    if (busy.current) return
    const { offset: o, velocity: v } = info
    if (phase === 'open') return Math.hypot(o.x, o.y) > 110 || Math.hypot(v.x, v.y) > 700 ? dismiss(o.x || v.x, o.y || v.y) : springBack()
    if (dy.get() < -90 || v.y < -600) return draw()
    if ((Math.abs(o.x) > 80 || Math.abs(v.x) > 600) && Math.abs(o.y) < 70) return switchMode(o.x < 0 ? 1 : -1)
    springBack()
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && bubble) return setBubble(false)
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault()
      if (phase === 'open') dismiss()
      else if (e.key !== 'Escape') draw()
    } else if (phase === 'deck' && e.key === 'ArrowRight') switchMode(1)
    else if (phase === 'deck' && e.key === 'ArrowLeft') switchMode(-1)
  }

  // Globo de info: solo texto que ya existe en la app (pasos de cada modo y las cartas de la tirada).
  const info = (() => {
    if (!face) return null
    if (face.seed) return { title: 'De dónde sale', lines: face.seed.map((c) => `${c.label} · ${c.text}`) }
    const [t, d] = mode === 'spark' ? MODES.spark.steps[3] : mode === 'break' ? MODES.break.steps[2] : cat === 'OFICIO' ? MODES.craft.steps[4] : MODES.craft.steps[3]
    return { title: t, lines: [d] }
  })()

  const open = phase === 'open'
  const k = Math.min(1, full.w / 382)

  return (
    <div ref={root} className="relative h-full overflow-hidden bg-surface" style={{ touchAction: 'none' }}>
      <div ref={probe} aria-hidden className="pointer-events-none absolute" style={{ top: 'var(--sat)', height: 'var(--sab)' }} />

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
          {LAB_MODES.map((key, i) => (
            <button
              key={key}
              role="tab"
              aria-selected={i === mi}
              onClick={() => i !== mi && switchMode(i > mi ? 1 : -1)}
              className={`t-ui relative pb-2 text-[11px] transition-colors ${i === mi ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-blue' : 'text-muted3'}`}
            >
              {MODES[key].title}
            </button>
          ))}
        </div>
        {mode === 'craft' && phase === 'deck' && (
          <div className="anim-fade-in mt-3 flex justify-center gap-1">
            {CRAFT_ORDER.map((c) => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={c === cat} className={`t-ui px-2 py-1.5 text-[8.5px] tracking-[0.06em] transition-colors ${c === cat ? 'bg-ink text-surface' : 'text-muted2 hover:text-ink'}`}>
                {craft[c].name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Spark: las cartas ya robadas, en miniatura, esperando la frase */}
      {mode === 'spark' && sparkRun.length > 0 && (
        <div aria-hidden className="absolute inset-x-0 flex justify-center gap-3" style={{ top: Math.max(size.h * 0.13, 104) + 40 }}>
          {SPARK_ORDER.map((key, i) => (
            <div key={key} className="relative" style={{ width: CW * 0.32, height: CH * 0.32, rotate: `${(i - 1) * 5}deg` }}>
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

      {phase === 'deck' && (
        <div className="absolute inset-x-0 flex justify-center" style={{ top: rest.y - 72 }}>
          <GestureHint color={m.color} />
        </div>
      )}

      {/* El mazo en la mano: cartas sueltas, cada una con su inclinación */}
      {layerTilts.map((tilt, i) => (
        <Layer key={i} i={i} tilt={tilt} dx={dx} dy={dy} jump={jump} color={m.color} style={{ left: rest.x, top: rest.y + (LAYERS - i) * 2, width: W, height: H }} />
      ))}

      <motion.div
        role={open ? 'group' : 'button'}
        tabIndex={0}
        aria-label={open && face ? `${face.label}. ${face.text}. Lánzala o pulsa Intro para soltarla` : `Mazo de ${m.title}, roba una carta. Flechas para cambiar de mazo`}
        onPointerDown={() => {
          moved.current = false
          if (phase === 'deck' && !busy.current) animate(scale, 1.03, go(SNAP))
        }}
        onPointerUp={() => phase === 'deck' && !busy.current && animate(scale, 1, go(WOBBLE))}
        onClick={() => !moved.current && phase === 'deck' && draw()}
        onKeyDown={onKeyDown}
        onPan={onPan}
        onPanEnd={onPanEnd}
        className="absolute left-0 top-0 outline-offset-4"
        style={{ x, y, width: w, height: h, rotate, scale, opacity, zIndex: phase === 'deck' ? 20 : 40, perspective: 1600, touchAction: 'none', cursor: 'grab' }}
      >
        <motion.div className="relative size-full" style={{ rotateY, transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            <CardBack color={m.color} title={m.title} label={backLabel} titleSize={34 * s} r={22} />
          </div>
          <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            {face && (
              <div
                className="card-face flex flex-col text-ink"
                style={{ background: face.color, padding: 28, ['--r' as string]: '22px', boxShadow: '0 24px 60px rgba(23,21,15,.22)', border: face.seed ? '1.5px solid #17150F' : undefined } as React.CSSProperties}
                aria-hidden
              >
                <div className="t-mono text-[10px]" style={{ opacity: 'var(--dim)' }}>
                  {face.label}
                </div>
                <p className="t-serif mt-auto" style={{ fontSize: fullSize(face.text.length) * k, lineHeight: 1.15 }}>
                  {face.text}
                </p>
                <div className="t-mono mt-6 text-[8.5px]" style={{ opacity: 0.45 }}>
                  Lánzala para soltarla
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* El patito de la esquina abre el globo con la info de la carta */}
        <AnimatePresence>
          {open && info && (
            <motion.button
              key="duck"
              type="button"
              aria-expanded={bubble}
              aria-label={bubble ? 'Cerrar info' : 'Ver info de la carta'}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                buzz(6)
                setBubble((b) => !b)
              }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: bubble ? 8 : 0 }}
              exit={{ scale: 0 }}
              transition={go(WOBBLE)}
              whileTap={{ scale: 0.88 }}
              className="absolute flex size-12 items-center justify-center rounded-full border-[1.5px] border-ink bg-surface"
              style={{ top: 16, right: 16 }}
            >
              <Mascot size={30} />
            </motion.button>
          )}
          {open && bubble && info && (
            <motion.div
              key="bubble"
              role="note"
              initial={{ scale: 0.3, opacity: 0, rotate: 6 }}
              animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
              exit={{ scale: 0.3, opacity: 0, rotate: 6, transition: { duration: 0.15 } }}
              transition={go({ ...WOBBLE, opacity: { duration: 0.15 } })}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bg-ink px-4 pb-4 pt-3.5 text-surface"
              style={{ top: 76, right: 20, width: Math.min(286, full.w - 40), transformOrigin: 'calc(100% - 20px) -10px', borderRadius: 14 }}
            >
              <span aria-hidden className="absolute -top-[7px] right-[18px] size-3.5 rotate-45 bg-ink" />
              <div className="t-mono text-[8.5px] text-surface/70">{info.title}</div>
              {info.lines.map((l) => (
                <p key={l} className="mt-2 text-[13.5px] font-medium leading-[1.45]">
                  {l}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
