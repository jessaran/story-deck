import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react'
import { useRef } from 'react'
import logo from '../assets/logo-stack.webp'
import { buzz } from '../lib/haptics'
import { GestureHint } from './GestureHint'

/** Pantalla de entrada: el logo se desliza hacia arriba, como robar la primera carta del mazo. */
export function LogoSplash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const y = useMotionValue(0)
  const rotate = useTransform(y, [-300, 0], [-6, 0])
  const opacity = useTransform(y, [-420, -120, 0], [0, 1, 1])
  const done = useRef(false)

  function leave() {
    if (done.current) return
    done.current = true
    buzz(20)
    animate(y, -window.innerHeight, reduce ? { duration: 0 } : { duration: 0.42, ease: 'easeIn' })
    window.setTimeout(onDone, reduce ? 0 : 420)
  }

  function onPanEnd(_: PointerEvent, info: PanInfo) {
    if (y.get() < -90 || info.velocity.y < -500) return leave()
    animate(y, 0, { type: 'spring', stiffness: 220, damping: 12 })
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-6" style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}>
      <motion.button
        type="button"
        aria-label="Desliza el logo hacia arriba para empezar"
        onClick={leave}
        onPan={(_, info) => !done.current && y.set(info.offset.y < 0 ? info.offset.y : info.offset.y * 0.2)}
        onPanEnd={onPanEnd}
        className="anim-fade-in block w-full max-w-[260px] cursor-grab"
        style={{ y, rotate, opacity, touchAction: 'none' }}
      >
        <img src={logo} alt="Story Deck" width={478} height={640} draggable={false} className="block h-auto w-full" />
      </motion.button>

      <div aria-hidden className="mt-12 flex flex-col items-center gap-3">
        <GestureHint color="#4468FF" />
        <span className="t-label">Desliza hacia arriba</span>
      </div>
    </div>
  )
}
