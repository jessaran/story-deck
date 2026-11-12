import { motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useEffect, useState } from 'react'
import bot from '../assets/intro/card-bot.webp'
import mid from '../assets/intro/card-mid.webp'
import top from '../assets/intro/card-top.webp'
import word from '../assets/intro/wordmark.webp'
import { buzz } from '../lib/haptics'
import { GestureHint } from './GestureHint'

const BOX_W = 737
const BOX_H = 984
// Las letras empiezan centradas en la caja y bajan a su sitio cuando llegan las cartas.
const WORD_OFFSET = (BOX_H / 2 - (634 + 979) / 2) / BOX_H
const EASE = [0.22, 1, 0.36, 1] as const
const CARDS = [bot, mid, top]

/**
 * Pantalla de entrada: arranca solo con «STORY DECK.»; al deslizar hacia arriba, las tres cartas
 * caen una a una y se apilan hasta formar el logo. Después pasa sola a la pantalla del nombre.
 */
export function LogoSplash({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [built, setBuilt] = useState(false)

  useEffect(() => {
    if (!built) return
    const id = window.setTimeout(onDone, reduce ? 300 : 2300)
    return () => clearTimeout(id)
  }, [built, reduce, onDone])

  function build() {
    if (built) return
    buzz(14)
    setBuilt(true)
  }
  const onPanEnd = (_: PointerEvent, info: PanInfo) => (info.offset.y < -60 || info.velocity.y < -400) && build()
  const t = (delay: number, duration = 0.9) => (reduce ? { duration: 0 } : { duration, delay, ease: EASE })

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Desliza hacia arriba para empezar"
      onPanEnd={onPanEnd}
      onClick={build}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && build()}
      className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-6 outline-none"
      style={{ touchAction: 'none', paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      <div role="img" aria-label="Story Deck" className="relative w-[min(300px,68vw)]" style={{ aspectRatio: `${BOX_W} / ${BOX_H}` }}>
        {/* De abajo arriba: cada carta cae y se posa sobre la anterior */}
        {CARDS.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full"
            initial={{ y: '-55%', rotate: i % 2 ? 7 : -7, scale: 1.06, opacity: 0 }}
            animate={built ? { y: '0%', rotate: 0, scale: 1, opacity: 1 } : undefined}
            transition={{ ...t(0.15 + i * 0.32, 0.85), opacity: t(0.15 + i * 0.32, 0.3) }}
          />
        ))}
        <motion.img
          src={word}
          alt=""
          draggable={false}
          className="anim-fade-in absolute inset-0 size-full"
          initial={{ y: `${WORD_OFFSET * 100}%` }}
          animate={{ y: built ? '0%' : `${WORD_OFFSET * 100}%` }}
          transition={t(0, 1)}
        />
      </div>

      <motion.div aria-hidden className="mt-12 flex h-[80px] flex-col items-center gap-3" animate={{ opacity: built ? 0 : 1 }} transition={{ duration: 0.25 }}>
        <GestureHint color="#4468FF" />
        <span className="t-label">Desliza hacia arriba</span>
      </motion.div>
    </motion.div>
  )
}
