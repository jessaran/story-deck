import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { buzz } from '../lib/haptics'
import { Deck } from './Deck'
import type { Face } from './CardFaces'
import { GestureHint } from './GestureHint'

/** Mazo de una carta compartido por Craft y Break: sacar, girar, «Otra carta». */
export function SingleDraw({
  color,
  title,
  label,
  draw,
  disabled,
  againLabel,
  belowWhenDisabled,
  shuffleKey: externalShuffle = 0,
}: {
  color: string
  title: string
  label: string
  /** Devuelve la nueva carta; recibe la anterior para no repetirla. */
  draw: (prev: string | undefined) => Face
  disabled?: boolean
  againLabel: string
  belowWhenDisabled?: React.ReactNode
  shuffleKey?: number
}) {
  const { logCard, announce } = useStore()
  const [face, setFace] = useState<Face | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [landed, setLanded] = useState(false)
  const [shuffle, setShuffle] = useState(0)
  const latest = useRef<Face | null>(null)

  function onLaunch() {
    const next = draw(face?.text)
    latest.current = next
    setFace(next)
    setRevealed(true)
    logCard(next)
  }
  function onLanded() {
    setLanded(true)
    const f = latest.current
    if (f) announce(`${f.label}. ${f.text}`)
  }
  function again() {
    buzz(8)
    setRevealed(false)
    setLanded(false)
    setTimeout(() => setShuffle((n) => n + 1), 380)
  }

  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 160 }}>
        <Deck
          mode="flip"
          color={color}
          title={title}
          label={label}
          face={face}
          revealed={revealed}
          onLaunch={onLaunch}
          onLanded={onLanded}
          disabled={disabled}
          shuffleKey={shuffle + externalShuffle}
          ariaLabel={`Mazo de ${title}, roba una carta`}
        />
      </div>
      <div className="absolute left-0 right-0 flex justify-center" style={{ top: 508 }}>
        {disabled ? belowWhenDisabled : revealed ? landed && (
          <button type="button" onClick={again} className="btn btn-primary anim-fade-in min-w-[236px]">
            {againLabel}
          </button>
        ) : (
          <GestureHint color={color} />
        )}
      </div>
    </>
  )
}
