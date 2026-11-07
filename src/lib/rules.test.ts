import { describe, expect, it } from 'vitest'
import { applyMatch, localDay, matchedToday, nextTip, pickNoRepeat, pushHist, seedPhrase } from './rules'
import { breakCards, craft, DRAW_DECK_SIZE, spark, SPARK_ORDER, tips } from './content'

describe('contenido', () => {
  it('tiene 24 Spark, 28 Craft, 17 Break y 40 tips', () => {
    expect(Object.values(spark).reduce((n, d) => n + d.items.length, 0)).toBe(24)
    expect(Object.values(craft).reduce((n, d) => n + d.items.length, 0)).toBe(28)
    expect(breakCards).toHaveLength(17)
    expect(tips).toHaveLength(40)
    expect(DRAW_DECK_SIZE).toBe(69)
  })
  it('Spark siempre en orden QUIÉN → GRIETA → FRICCIÓN', () => {
    expect(SPARK_ORDER.map((k) => spark[k].name)).toEqual(['QUIÉN', 'GRIETA', 'FRICCIÓN'])
    expect(seedPhrase('a', 'b', 'c')).toBe('Protagonista: a. Todo se rompe cuando b. Y lo complica que c.')
  })
})

describe('sorteo sin repetición inmediata', () => {
  it('nunca repite la anterior', () => {
    for (let i = 0; i < 500; i++) {
      const prev = breakCards[i % breakCards.length]
      expect(pickNoRepeat(breakCards, prev)).not.toBe(prev)
    }
  })
  it('con una sola carta la devuelve igualmente', () => {
    expect(pickNoRepeat(['x'], 'x')).toBe('x')
  })
})

describe('historial', () => {
  it('guarda solo las 5 últimas, la más reciente primero', () => {
    let h = [] as { label: string; text: string; color: string }[]
    for (let i = 0; i < 8; i++) h = pushHist(h, { label: 'L', text: String(i), color: '#000' })
    expect(h.map((e) => e.text)).toEqual(['7', '6', '5', '4', '3'])
  })
})

describe('Tip Day', () => {
  const ids = tips.map((t) => t.id)
  const empty = { coll: [], day: null, last: null }

  it('fecha local en formato YYYY-MM-DD', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('un solo match por día natural', () => {
    const a = applyMatch(empty, 3, '2026-11-07')
    expect(a).toEqual({ coll: [3], day: '2026-11-07', last: 3 })
    expect(matchedToday(a, '2026-11-07')).toBe(true)
    expect(applyMatch(a, 9, '2026-11-07')).toBe(a) // bloqueado
    const b = applyMatch(a, 9, '2026-11-08')
    expect(b.coll).toEqual([3, 9])
    expect(matchedToday(b, '2026-11-07')).toBe(false)
  })

  it('prioriza no coleccionadas y evita la actual y la última', () => {
    const tip = { coll: ids.slice(0, 38), day: '2026-11-06', last: 38 }
    for (let i = 0; i < 100; i++) {
      const n = nextTip(ids, tip, 39)
      expect(n).toBe(40)
    }
  })

  it('con las 40 reunidas sigue funcionando (repite coleccionadas)', () => {
    const tip = { coll: [...ids], day: '2026-11-06', last: 40 }
    for (let i = 0; i < 100; i++) {
      const n = nextTip(ids, tip, 1)
      expect(ids).toContain(n)
      expect([1, 40]).not.toContain(n)
    }
  })

  it('los descartes no entran en la colección', () => {
    // descartar = pedir otra candidata; la colección solo cambia con applyMatch
    const tip = { ...empty }
    nextTip(ids, tip, 5)
    expect(tip.coll).toEqual([])
  })
})
