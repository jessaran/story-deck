import { useState } from 'react'
import { Header } from '../components/Header'
import { SingleDraw } from '../components/SingleDraw'
import { Stage } from '../components/Stage'
import { TutorialSheet } from '../components/Sheets'
import { craft, CRAFT_ORDER, type CraftKey } from '../lib/content'
import { buzz } from '../lib/haptics'
import { MODES } from '../lib/modes'
import { pickNoRepeat } from '../lib/rules'

export function Craft() {
  const m = MODES.craft
  const [tut, setTut] = useState(false)
  const [cat, setCat] = useState<CraftKey | null>(null)
  const [shuffle, setShuffle] = useState(0)

  function pick(k: CraftKey) {
    if (k === cat) return
    buzz(8)
    setCat(k)
    setShuffle((n) => n + 1)
  }

  return (
    <>
      <Header title={m.title} sub={m.sub} color={m.color} onInfo={() => setTut(true)} />
      <Stage label="Mazo de Craft">
        <div role="radiogroup" aria-label="Categoría" className="absolute left-0 right-0 top-3 flex justify-center gap-1 px-3">
          {CRAFT_ORDER.map((k) => {
            const on = k === cat
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(k)}
                className={`t-ui flex h-[34px] min-w-0 flex-1 items-center justify-center border px-1 text-[9px] tracking-[0.05em] transition-colors ${on ? 'border-ink bg-ink text-surface' : 'border-transparent text-ink hover:border-ink'}`}
                style={on ? undefined : { background: m.color }}
              >
                {craft[k].name}
              </button>
            )
          })}
        </div>
        {/* key: al cambiar de categoría el mazo vuelve boca abajo */}
        <SingleDraw
          key={cat ?? 'none'}
          color={m.color}
          title="Craft"
          label={cat ? craft[cat].name : '5 sub-mazos'}
          disabled={!cat}
          shuffleKey={shuffle}
          againLabel={cat ? `Otra carta de ${craft[cat].name}` : ''}
          belowWhenDisabled={<div className="t-mono pt-3 text-[9px] text-muted2">Elige una categoría ↑</div>}
          draw={(prev) => {
            const d = craft[cat!]
            return { label: d.name.toUpperCase(), color: d.color, text: pickNoRepeat(d.items, prev) }
          }}
        />
      </Stage>
      <TutorialSheet mode={tut ? 'craft' : null} onClose={() => setTut(false)} />
    </>
  )
}
