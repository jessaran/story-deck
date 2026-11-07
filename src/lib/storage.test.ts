import { describe, expect, it } from 'vitest'
import { emptyState, load, sanitize, save, STORE_KEY } from './storage'

function mem(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  }
}

describe('almacén local', () => {
  it('estado vacío en el primer acceso', () => {
    expect(load(mem())).toEqual(emptyState())
  })

  it('guarda y recupera tras recargar', () => {
    const ls = mem()
    const s = { ...emptyState(), name: 'Alba', draws: 46, onboarded: true, tip: { coll: [3], day: '2026-11-07', last: 3 } }
    expect(save(s, ls)).toBe(true)
    expect(load(ls)).toEqual(s)
  })

  it('JSON corrupto no rompe la app', () => {
    expect(load(mem({ [STORE_KEY]: '{oops' }))).toEqual(emptyState())
  })

  it('valida tipos y recorta el historial a 5', () => {
    const s = sanitize({ name: 42, draws: -3, hist: Array(9).fill({ label: 'A', text: 'b', color: '#fff', extra: 1 }), tip: { coll: [1, 1, 'x', 2], day: 'ayer' } })
    expect(s.name).toBe('')
    expect(s.draws).toBe(0)
    expect(s.hist).toHaveLength(5)
    expect(s.hist[0]).toEqual({ label: 'A', text: 'b', color: '#fff' })
    expect(s.tip).toEqual({ coll: [1, 2], day: null, last: null })
  })

  it('migra las claves del prototipo (lumo.deck.v2 / tip.v1 / onb.v1)', () => {
    const ls = mem({
      'lumo.deck.v2': JSON.stringify({ hist: [{ label: 'MUNDO', text: 't', color: '#9DBBFF' }], name: 'Alba', draws: 46 }),
      'lumo.tip.v1': JSON.stringify({ coll: [2, 16, 28], day: '2026-08-27', last: 28 }),
      'lumo.onb.v1': JSON.stringify({ done: true, hour: '10:00', notif: true }),
    })
    const s = load(ls)
    expect(s).toMatchObject({ name: 'Alba', draws: 46, onboarded: true, tip: { coll: [3, 17, 29], day: '2026-08-27', last: 29 } })
    expect(JSON.parse(ls.m.get(STORE_KEY)!)).toEqual(s)
  })

  it('acepta el almacén lumo.v3 del brief', () => {
    const ls = mem({ 'lumo.v3': JSON.stringify({ version: 3, name: 'Alba', draws: 2, hist: [], tip: { coll: [1], day: null, last: 1 }, onboarded: true }) })
    expect(load(ls)).toMatchObject({ name: 'Alba', draws: 2, onboarded: true })
  })

  it('si el navegador no deja escribir, devuelve false sin lanzar', () => {
    const ls = { ...mem(), setItem: () => { throw new Error('QuotaExceeded') } }
    expect(save(emptyState(), ls)).toBe(false)
  })
})
