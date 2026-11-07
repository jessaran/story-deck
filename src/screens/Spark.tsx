import { useEffect, useRef, useState } from 'react'
import { CardBack, CardFront, type Face } from '../components/CardFaces'
import { Deck } from '../components/Deck'
import { GestureHint } from '../components/GestureHint'
import { Header } from '../components/Header'
import { TutorialSheet } from '../components/Sheets'
import { Stage } from '../components/Stage'
import { spark, SPARK_ORDER, type SparkKey } from '../lib/content'
import { buzz } from '../lib/haptics'
import { MODES } from '../lib/modes'
import { pickNoRepeat, seedPhrase } from '../lib/rules'
import { useStore } from '../state/store'

type SCard = Face & { key: SparkKey; flipped: boolean }
const SUSPENSE_MS = 340

function makeCard(k: SparkKey, prev?: string): SCard {
  const d = spark[k]
  return { key: k, label: d.name, color: d.color, text: pickNoRepeat(d.items, prev), flipped: false }
}

export function Spark() {
  const m = MODES.spark
  const { logCard, announce } = useStore()
  const [tut, setTut] = useState(false)
  const [phase, setPhase] = useState<'deck' | 'reveal'>('deck')
  const [pulled, setPulled] = useState<SCard[]>([])
  const [cards, setCards] = useState<SCard[]>([])
  const [front, setFront] = useState(-1)
  const [lifting, setLifting] = useState(-1)
  const [shuffle, setShuffle] = useState(0)
  const prevTexts = useRef<Partial<Record<SparkKey, string>>>({})
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  function pullOne() {
    const k = SPARK_ORDER[pulled.length]
    if (!k) return
    const c = makeCard(k, prevTexts.current[k])
    prevTexts.current[k] = c.text
    const next = [...pulled, c]
    setPulled(next)
    if (next.length === 3) later(() => setPhase('reveal'), 460)
    setCards(next)
  }

  function tap(i: number) {
    const c = cards[i]
    if (!c || lifting >= 0) return
    setFront(i)
    if (c.flipped) return
    buzz(8)
    setLifting(i)
    later(() => {
      buzz(18)
      setLifting(-1)
      // Los toques quedan bloqueados mientras `lifting`, así que `cards` sigue vigente.
      const next = cards.map((x, j) => (j === i ? { ...x, flipped: true } : x))
      setCards(next)
      const done = (cs: SCard[]) => cs.length >= 3 && cs.slice(0, 3).every((x) => x.flipped)
      if (done(next) && !done(cards)) announce(`Frase-semilla. ${seedPhrase(next[0].text, next[1].text, next[2].text)}`)
      else announce(`${c.label}. ${c.text}`)
      logCard({ label: c.label, text: c.text, color: c.color })
    }, SUSPENSE_MS)
  }

  function forceYsi() {
    if (cards.length > 3) return
    buzz(12)
    const c = makeCard('YSI', prevTexts.current.YSI)
    prevTexts.current.YSI = c.text
    setCards((cs) => [...cs, c])
  }

  function reset() {
    buzz(8)
    setPhase('deck')
    setPulled([])
    setCards([])
    setFront(-1)
    setShuffle((n) => n + 1)
  }

  const allThree = cards.length >= 3 && cards.slice(0, 3).every((c) => c.flipped)
  const ysi = cards[3]
  const n = cards.length
  const spread = 82 * (n > 3 ? 0.78 : 1)

  return (
    <>
      <Header title={m.title} sub={m.sub} color={m.color} onInfo={() => setTut(true)} />
      <Stage label="Mazo de Spark" scroll={phase === 'reveal'}>
        {phase === 'deck' ? (
          <>
            {/* Huecos punteados: qué hay que conseguir. No son jugables. */}
            <div aria-hidden className="absolute left-1/2" style={{ top: 6 }}>
              {SPARK_ORDER.map((k, i) => {
                const filled = pulled[i]
                return (
                  <div
                    key={k}
                    className="absolute"
                    style={{
                      width: 104,
                      height: 146,
                      left: -52,
                      transform: `translateX(${(i - 1) * 86}px) rotate(${(i - 1) * 8}deg)`,
                      transformOrigin: '50% 90%',
                      zIndex: i === 1 ? 2 : 1,
                    }}
                  >
                    <div className="flex size-full items-center justify-center" style={{ borderRadius: 10, background: 'rgba(23,21,15,.03)', border: '1.5px dashed rgba(23,21,15,.22)' }}>
                      <span className="t-mono text-[7.5px] text-muted2">{spark[k].name}</span>
                    </div>
                    {filled && (
                      <div className="anim-bounce-in absolute inset-0" style={{ transformOrigin: '50% 82%' }}>
                        <CardBack color={filled.color} title="" label={spark[k].name} r={10} markSize={34} titleSize={0} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 160 }}>
              <Deck mode="throw" color={m.color} title="Spark" label="Quién · Grieta · Fricción" onLaunch={pullOne} disabled={pulled.length >= 3} shuffleKey={shuffle} ariaLabel={`Mazo de Spark, roba la carta ${SPARK_ORDER[pulled.length] ? spark[SPARK_ORDER[pulled.length]].name : ''}`} />
            </div>
            <div className="absolute left-0 right-0 flex flex-col items-center gap-3" style={{ top: 508 }}>
              <GestureHint color={m.color} />
              <div className="t-mono text-[9px] text-muted2" aria-live="polite">
                {pulled.length}/3
              </div>
            </div>
          </>
        ) : (
          <div className="relative pb-8">
            <div className="relative" style={{ height: 300 }}>
              {cards.map((c, i) => {
                const off = i - (n - 1) / 2
                const lift = lifting === i ? ' translateY(-18px) scale(1.04)' : ''
                return (
                  <div
                    key={c.key}
                    className="absolute left-1/2"
                    style={{
                      top: 44,
                      width: 152,
                      height: 220,
                      marginLeft: -76,
                      transform: `translateX(${off * spread}px) translateY(${Math.abs(off) * 13}px) rotate(${off * 11}deg)${lift}`,
                      transition: 'transform .5s cubic-bezier(.2,.9,.2,1)',
                      zIndex: front === i ? 60 : 10 + i,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => tap(i)}
                      aria-label={c.flipped ? `${c.label}. ${c.text}` : `Carta ${c.label}, boca abajo. Gírala`}
                      className="anim-bounce-in block size-full"
                      style={{ animationDelay: `${(i >= 3 ? 0 : i) * 0.08}s`, transformOrigin: '50% 82%', perspective: 1000 }}
                    >
                      <div className="relative size-full" style={{ transformStyle: 'preserve-3d', transition: 'transform .72s var(--ease-flip)', transform: `rotateY(${c.flipped ? 180 : 0}deg)` }}>
                        <CardBack color={c.color} title="" label={c.label} r={14} markSize={44} titleSize={0} />
                        <CardFront face={c} back big={false} r={14} pad={14} hidden />
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>

            {allThree && (
              <div className="anim-stage-in px-[22px]">
                <div className="bg-ink px-5 py-5 text-surface">
                  <div className="t-mono text-[8.5px] text-surface/80">Frase-semilla</div>
                  <p className="t-serif mt-3 text-[21px] leading-[1.28]">{seedPhrase(cards[0].text, cards[1].text, cards[2].text)}</p>
                  {ysi?.flipped && <p className="t-serif mt-3 border-t border-surface/20 pt-3 text-[19px] leading-[1.28] text-tip">{ysi.text}</p>}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {!ysi && (
                    <button type="button" className="btn btn-ghost w-full" onClick={forceYsi}>
                      Forzar una carta Y SI…
                    </button>
                  )}
                  <button type="button" className="btn btn-primary w-full" onClick={reset}>
                    Otra tirada
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Stage>
      <TutorialSheet mode={tut ? 'spark' : null} onClose={() => setTut(false)} />
    </>
  )
}
