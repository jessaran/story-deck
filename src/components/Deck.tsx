import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { buzz } from '../lib/haptics'
import { CardBack, CardFront, type Face } from './CardFaces'

export const DECK_W = 236
export const DECK_H = 334
const LAYERS = 8
const THRESHOLD = -78
const BACK_EASE = [0.2, 1.3, 0.4, 1] as const
const FLIP_EASE = [0.3, 0.85, 0.25, 1] as const

type Props = {
  color: string
  title: string
  label: string
  /** flip: la carta sale, se gira y vuelve al tope (Craft, Break). throw: sale y desaparece (Spark, Tip Day). */
  mode: 'flip' | 'throw'
  /** Llamado al superar el umbral. En modo flip debe dejar listo `face`. */
  onLaunch: () => void
  /** Modo flip: fin del movimiento continuo (carta ya girada). */
  onLanded?: () => void
  disabled?: boolean
  face?: Face | null
  revealed?: boolean
  /** Cambiarlo dispara el barajado (5 pasos de 95 ms). */
  shuffleKey?: number
  ariaLabel: string
}

export function Deck({ color, title, label, mode, onLaunch, onLanded, disabled, face, revealed = false, shuffleKey = 0, ariaLabel }: Props) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const opacity = useMotionValue(1)
  const busy = useRef(false)
  const moved = useRef(false)
  const [jitter, setJitter] = useState<number | null>(null)

  // Barajar: jitter senoidal refrescado 5 veces cada 95 ms.
  useEffect(() => {
    if (!shuffleKey || reduce) return
    buzz(12)
    let n = 0
    setJitter(Math.random())
    const id = setInterval(() => {
      n++
      if (n >= 5) {
        clearInterval(id)
        setJitter(null)
      } else setJitter(Math.random())
    }, 95)
    return () => clearInterval(id)
  }, [shuffleKey, reduce])

  // «Otra carta»: la carta revelada vuelve boca abajo al mazo.
  useEffect(() => {
    if (mode === 'flip' && !revealed && rotateY.get() !== 0) {
      if (reduce) rotateY.set(0)
      else animate(rotateY, 0, { duration: 0.45, ease: FLIP_EASE })
    }
  }, [revealed, mode, rotateY, reduce])

  const canDrag = !disabled && !(mode === 'flip' && revealed)

  function springBack() {
    const t = reduce ? { duration: 0 } : { duration: 0.44, ease: BACK_EASE }
    animate(x, 0, t)
    animate(y, 0, t)
    animate(rotate, 0, t)
  }

  async function launch() {
    if (busy.current || !canDrag) return
    busy.current = true
    buzz(16)
    onLaunch()
    if (reduce) {
      x.set(0)
      y.set(0)
      rotate.set(0)
      if (mode === 'flip') {
        rotateY.set(180)
        onLanded?.()
      }
      busy.current = false
      return
    }
    if (mode === 'throw') {
      await Promise.all([
        animate(y, y.get() - 360, { duration: 0.3, ease: 'easeIn' }),
        animate(opacity, 0, { duration: 0.3, ease: 'easeIn' }),
      ])
      x.set(0)
      y.set(0)
      rotate.set(0)
      animate(opacity, 1, { duration: 0.22 })
    } else {
      // Un solo movimiento continuo: sube, se gira y vuelve al tope del mazo.
      const from = y.get()
      await Promise.all([
        animate(y, [from, -250, 0], { duration: 0.95, times: [0, 0.4, 1], ease: ['easeOut', BACK_EASE] }),
        animate(x, 0, { duration: 0.6, ease: 'easeOut' }),
        animate(rotate, 0, { duration: 0.6, ease: 'easeOut' }),
        animate(rotateY, 180, { duration: 0.72, delay: 0.16, ease: FLIP_EASE }),
      ])
      buzz(20)
      onLanded?.()
    }
    busy.current = false
  }

  function onPanStart() {
    moved.current = true
  }
  function onPan(_: PointerEvent, info: PanInfo) {
    if (busy.current || !canDrag) return
    x.set(info.offset.x * 0.55)
    y.set(Math.min(0, info.offset.y))
    rotate.set(info.offset.x * 0.035)
  }
  function onPanEnd() {
    if (busy.current || !canDrag) return
    if (y.get() < THRESHOLD) launch()
    else springBack()
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      launch()
    }
  }

  return (
    <div className="relative" style={{ width: DECK_W, height: DECK_H }}>
      {Array.from({ length: LAYERS }, (_, i) => {
        const jx = jitter == null ? 0 : Math.sin(jitter * 97 + i * 2.7) * 7
        const jy = jitter == null ? 0 : Math.cos(jitter * 61 + i * 1.9) * 6
        return (
          <div
            key={i}
            aria-hidden
            className="absolute inset-0"
            style={{
              borderRadius: 18,
              background: color,
              boxShadow: `0 ${4 + i}px ${12 + i * 2}px rgba(23,21,15,.16), inset 0 0 0 2px #fff`,
              transform: `translate(${jx}px, ${-i * 2.4 + jy}px) rotate(${jx * 0.55}deg)`,
              transition: 'transform .12s ease-out',
            }}
          />
        )
      })}

      <motion.div
        role={canDrag ? 'button' : undefined}
        tabIndex={canDrag ? 0 : -1}
        aria-label={canDrag ? ariaLabel : undefined}
        aria-disabled={disabled || undefined}
        onPointerDown={() => (moved.current = false)}
        onClick={() => !moved.current && launch()}
        onKeyDown={canDrag ? onKeyDown : undefined}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        className="absolute left-0 outline-offset-4"
        style={{
          top: -19,
          width: DECK_W,
          height: DECK_H,
          x,
          y,
          rotate,
          opacity,
          touchAction: 'none',
          cursor: canDrag ? 'grab' : 'default',
          perspective: 1000,
          zIndex: 5,
        }}
        whileTap={canDrag ? { cursor: 'grabbing' } : undefined}
      >
        <motion.div className="relative size-full" style={{ rotateY, transformStyle: 'preserve-3d' }}>
          <CardBack color={color} title={title} label={label} />
          {mode === 'flip' && face && <CardFront face={face} back pad={24} hidden={!revealed} />}
        </motion.div>
      </motion.div>
    </div>
  )
}
