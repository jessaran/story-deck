import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Deck } from '../components/Deck'
import { GestureHint } from '../components/GestureHint'
import { Header } from '../components/Header'
import { Stage } from '../components/Stage'
import { TIP_COLOR, tipCredit, tips, type Tip } from '../lib/content'
import { buzz } from '../lib/haptics'
import { TIP_MODE } from '../lib/modes'
import { matchedToday, nextTip } from '../lib/rules'
import { useStore } from '../state/store'

const IDS = tips.map((t) => t.id)
const byId = new Map(tips.map((t) => [t.id, t]))
const TOTAL = tips.length
const SWIPE = 70
const BACK_EASE = [0.2, 1.3, 0.4, 1] as const

export function TipDay() {
  const { state, matchTip, announce } = useStore()
  const [params, setParams] = useSearchParams()
  const view = params.get('v') === 'coleccion' ? 'coll' : 'card'
  const setView = (v: 'card' | 'coll') => setParams(v === 'coll' ? { v: 'coleccion' } : {}, { replace: true })
  const locked = matchedToday(state.tip)
  const [phase, setPhase] = useState<'deck' | 'card'>(locked ? 'card' : 'deck')
  const [current, setCurrent] = useState<number | null>(locked ? state.tip.last : null)
  const [matched, setMatched] = useState(locked)
  const count = state.tip.coll.length
  const complete = count >= TOTAL

  function take() {
    buzz(16)
    setCurrent(nextTip(IDS, state.tip, null))
    setPhase('card')
  }

  return (
    <>
      <Header title={TIP_MODE.title} sub={TIP_MODE.sub} color={TIP_COLOR} />
      {view === 'coll' ? (
        <Collection onBack={() => setView('card')} />
      ) : (
        <Stage label="Tip Day">
          {complete && !matched && phase === 'deck' && (
            <p className="t-serif absolute left-0 right-0 top-6 px-10 text-center text-[17px] leading-snug text-muted">Has reunido las 40 cartas de Tip Day. Puedes seguir revisitándolas.</p>
          )}
          {phase === 'deck' ? (
            <>
              <div className="t-mono absolute left-0 right-0 text-center text-[8.5px] text-muted2" style={{ top: 112 }}>
                Carta del día
              </div>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 160 }}>
                <Deck mode="throw" color={TIP_COLOR} title="Tip Day" label="1 carta · 1 match" onLaunch={take} ariaLabel="Mazo de Tip Day, roba la carta del día" />
              </div>
              <div className="absolute left-0 right-0 flex flex-col items-center gap-4" style={{ top: 508 }}>
                <GestureHint color={TIP_COLOR} />
                <button type="button" onClick={() => setView('coll')} className="t-mono text-[9px] text-muted underline decoration-ink/20 underline-offset-4 hover:text-ink">
                  {count}/{TOTAL} en tu colección
                </button>
              </div>
            </>
          ) : (
            current != null && (
              <SwipeCard
                key={current}
                tip={byId.get(current)!}
                matched={matched}
                onDiscard={() => {
                  buzz(8)
                  setCurrent(nextTip(IDS, state.tip, current))
                }}
                onMatch={() => {
                  const t = byId.get(current)!
                  buzz(24)
                  matchTip(t.id)
                  setMatched(true)
                  announce(`Match. ${t.back} ${tipCredit(t)}. Ya hiciste match hoy.`)
                }}
                count={count}
                onCollection={() => setView('coll')}
              />
            )
          )}
        </Stage>
      )}
    </>
  )
}

function frontSize(t: string) {
  return t.length > 80 ? 23 : t.length > 55 ? 26 : 30
}

function SwipeCard({ tip, matched, onDiscard, onMatch, count, onCollection }: { tip: Tip; matched: boolean; onDiscard: () => void; onMatch: () => void; count: number; onCollection: () => void }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const rotate = useTransform(x, (v) => v * 0.05)
  const rotateY = useMotionValue(matched ? 180 : 0)
  const discardScale = useTransform(x, [-SWIPE, 0], [1.1, 1], { clamp: true })
  const matchScale = useTransform(x, [0, SWIPE], [1, 1.1], { clamp: true })
  const discardBg = useTransform(x, [-SWIPE, 0], ['#17150F', '#FFFFFF'], { clamp: true })
  const discardFg = useTransform(x, [-SWIPE, 0], ['#FFFFFF', '#17150F'], { clamp: true })
  const matchBg = useTransform(x, [0, SWIPE], ['#FFFFFF', '#17150F'], { clamp: true })
  const matchFg = useTransform(x, [0, SWIPE], ['#17150F', '#FFFFFF'], { clamp: true })
  const busy = useRef(false)
  const [done, setDone] = useState(matched)

  async function discard() {
    if (busy.current || done) return
    busy.current = true
    if (!reduce) await animate(x, -460, { duration: 0.3, ease: 'easeIn' })
    onDiscard() // remonta con otra candidata (key)
  }
  async function match() {
    if (busy.current || done) return
    busy.current = true
    setDone(true)
    onMatch()
    if (reduce) {
      x.set(0)
      rotateY.set(180)
      return
    }
    animate(x, 0, { duration: 0.35, ease: 'easeOut' })
    await animate(rotateY, 180, { duration: 0.8, ease: [0.3, 0.85, 0.25, 1] })
  }
  function onPan(_: PointerEvent, info: PanInfo) {
    if (busy.current || done) return
    x.set(info.offset.x)
  }
  function onPanEnd() {
    if (busy.current || done) return
    const v = x.get()
    if (v > SWIPE) match()
    else if (v < -SWIPE) discard()
    else animate(x, 0, reduce ? { duration: 0 } : { duration: 0.44, ease: BACK_EASE })
  }

  return (
    <>
      <div className="t-mono absolute left-0 right-0 text-center text-[8.5px] text-muted2" style={{ top: 90 }}>
        Tu carta de hoy
      </div>
      <div className="absolute left-1/2" style={{ top: 120, width: 264, height: 360, marginLeft: -132 }}>
        <motion.div
          className={matched ? '' : 'anim-bounce-in'}
          style={{ width: '100%', height: '100%', x, rotate, touchAction: 'none', perspective: 1100, cursor: done ? 'default' : 'grab', transformOrigin: '50% 82%' }}
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <motion.div className="relative size-full" style={{ rotateY, transformStyle: 'preserve-3d' }}>
            <div className="card-face flex flex-col p-6 text-ink" style={{ background: TIP_COLOR, ['--r' as string]: '20px' }} role={done ? undefined : 'img'} aria-label={done ? undefined : `Tip Day. ${tip.front}`} aria-hidden={done || undefined}>
              <div className="t-mono text-[8.5px]" style={{ opacity: 'var(--dim)' }} aria-hidden>
                Tip Day
              </div>
              <p className="t-serif mt-auto leading-[1.16]" style={{ fontSize: frontSize(tip.front) }} aria-hidden>
                {tip.front}
              </p>
            </div>
            <div
              className="card-face flex flex-col p-6 text-cream"
              style={{ background: '#17150F', transform: 'rotateY(180deg)', ['--r' as string]: '20px' }}
              role={done ? 'img' : undefined}
              aria-label={done ? `${tip.front} ${tip.back} ${tipCredit(tip)}` : undefined}
              aria-hidden={!done || undefined}
            >
              <div className="t-mono text-[8.5px] text-tip" aria-hidden>
                Match
              </div>
              <p className="t-serif mt-auto text-[17.5px] leading-[1.3]" aria-hidden>
                {tip.back}
              </p>
              <div className="mt-4 text-[11.5px] font-bold leading-snug text-tip" aria-hidden>
                {tipCredit(tip)}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute left-0 right-0 flex flex-col items-center gap-3 px-[22px]" style={{ top: 506 }}>
        {done ? (
          <div className="anim-stage-in flex flex-col items-center gap-3">
            <p className="t-serif text-[17px] text-muted">Ya hiciste match hoy. Vuelve mañana.</p>
            <button type="button" className="btn btn-primary" onClick={onCollection}>
              Mi colección · {count}/{TOTAL}
            </button>
          </div>
        ) : (
          <div className="flex w-[264px] gap-2">
            <motion.button type="button" onClick={discard} className="btn flex-1 whitespace-nowrap border-ink px-2" style={{ scale: discardScale, background: discardBg, color: discardFg }}>
              ← Descartar
            </motion.button>
            <motion.button type="button" onClick={match} className="btn flex-1 whitespace-nowrap border-ink px-2" style={{ scale: matchScale, background: matchBg, color: matchFg }}>
              Match →
            </motion.button>
          </div>
        )}
      </div>
    </>
  )
}

function Collection({ onBack }: { onBack: () => void }) {
  const { state } = useStore()
  const list = [...state.tip.coll].reverse().map((id) => byId.get(id)).filter((t): t is Tip => !!t)
  return (
    <main className="anim-stage-in min-h-0 flex-1 overflow-y-auto px-[22px] pb-28 pt-5" aria-label="Mi colección">
      <div className="flex items-center justify-between">
        <h2 className="t-label">
          Mi colección · {list.length}/{TOTAL}
        </h2>
        <button type="button" onClick={onBack} className="link-arrow">
          ← Carta de hoy
        </button>
      </div>
      {list.length >= TOTAL && (
        <div className="mt-5 bg-blue px-5 py-5 text-surface">
          <div className="t-display text-[26px]">40/40</div>
          <p className="t-serif mt-2 text-[19px] leading-snug">Has reunido las 40 cartas de Tip Day.</p>
        </div>
      )}
      {list.length ? (
        <ul className="mt-5 flex flex-col gap-3">
          {list.map((t) => (
            <li key={t.id} className="overflow-hidden" style={{ borderRadius: 4 }}>
              <div className="px-5 pb-4 pt-3.5" style={{ background: TIP_COLOR }}>
                <div className="t-mono text-[8px]" style={{ opacity: 'var(--dim)' }}>
                  Tip Day
                </div>
                <p className="t-serif mt-2 text-[20px] leading-[1.2]">{t.front}</p>
              </div>
              <div className="bg-ink px-5 py-4 text-cream">
                <p className="t-serif text-[16px] leading-[1.32]">{t.back}</p>
                <div className="mt-2.5 text-[11.5px] font-bold text-tip">{tipCredit(t)}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-serif pt-8 text-[20px] text-muted">Todavía no has hecho match con ninguna carta.</p>
      )}
    </main>
  )
}
