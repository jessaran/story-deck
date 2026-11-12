import { motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import bot from '../assets/intro/card-bot.webp'
import mid from '../assets/intro/card-mid.webp'
import top from '../assets/intro/card-top.webp'
import word from '../assets/intro/wordmark.webp'
import { GestureHint } from '../components/GestureHint'
import { buzz } from '../lib/haptics'

/**
 * Prueba de animación de entrada (#/intro): arranca solo con «STORY DECK.» y, al deslizar,
 * las tres cartas caen una a una y se apilan hasta formar el logo completo.
 * shortcut: solo prueba, no está conectada al onboarding.
 */
const BOX_W = 737
const BOX_H = 984
// Las letras empiezan centradas en la caja y bajan a su sitio cuando llegan las cartas.
const WORD_OFFSET = (BOX_H / 2 - (634 + 979) / 2) / BOX_H
const EASE = [0.22, 1, 0.36, 1] as const
const CARDS = [bot, mid, top]

export function IntroLab() {
  const reduce = useReducedMotion()
  const [built, setBuilt] = useState(false)
  const [run, setRun] = useState(0)

  function build() {
    if (built) return
    buzz(14)
    setBuilt(true)
  }
  function replay() {
    setBuilt(false)
    setRun((n) => n + 1)
  }
  const onPanEnd = (_: PointerEvent, info: PanInfo) => (info.offset.y < -60 || info.velocity.y < -400) && build()
  const t = (delay: number, duration = 0.9) => (reduce ? { duration: 0 } : { duration, delay, ease: EASE })

  return (
    <motion.div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-6" style={{ touchAction: 'none', paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }} onPanEnd={onPanEnd} onClick={build}>
      <Link to="/" aria-label="Salir de la prueba" onClick={(e) => e.stopPropagation()} className="absolute right-5 flex size-8 items-center justify-center border border-ink/20 hover:border-ink" style={{ top: 'calc(var(--sat) + 14px)' }}>
        <X size={15} aria-hidden />
      </Link>

      <div key={run} role="img" aria-label="Story Deck" className="relative w-[min(300px,68vw)]" style={{ aspectRatio: `${BOX_W} / ${BOX_H}` }}>
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
          className="absolute inset-0 size-full"
          initial={{ y: `${WORD_OFFSET * 100}%` }}
          animate={{ y: built ? '0%' : `${WORD_OFFSET * 100}%` }}
          transition={t(0, 1)}
        />
      </div>

      <div className="mt-12 flex h-[80px] flex-col items-center gap-3">
        {built ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={t(1.6, 0.4)}
            onClick={(e) => {
              e.stopPropagation()
              replay()
            }}
            className="t-label"
          >
            Ver otra vez
          </motion.button>
        ) : (
          <>
            <GestureHint color="#4468FF" />
            <span className="t-label">Desliza hacia arriba</span>
          </>
        )}
      </div>
    </motion.div>
  )
}
