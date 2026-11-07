import { useState } from 'react'
import { Header } from '../components/Header'
import { SingleDraw } from '../components/SingleDraw'
import { Stage } from '../components/Stage'
import { TutorialSheet } from '../components/Sheets'
import { breakCards, BREAK_COLOR } from '../lib/content'
import { MODES } from '../lib/modes'
import { pickNoRepeat } from '../lib/rules'

export function Break() {
  const m = MODES.break
  const [tut, setTut] = useState(false)
  return (
    <>
      <Header title={m.title} sub={m.sub} color={m.color} onInfo={() => setTut(true)} />
      <Stage label="Mazo de Break">
        <SingleDraw
          color={m.color}
          title="Break"
          label={m.mech}
          againLabel="Otra carta"
          draw={(prev) => ({ label: 'BREAK', color: BREAK_COLOR, text: pickNoRepeat(breakCards, prev) })}
        />
      </Stage>
      <TutorialSheet mode={tut ? 'break' : null} onClose={() => setTut(false)} />
    </>
  )
}
