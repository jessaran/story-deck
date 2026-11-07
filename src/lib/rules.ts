import type { HistEntry, TipState } from './storage'

export const HIST_LIMIT = 5

/** Elige al azar evitando repetir `avoid` (la carta anterior del mismo mazo). */
export function pickNoRepeat<T>(list: readonly T[], avoid?: T, rnd: () => number = Math.random): T {
  const pool = list.length > 1 && avoid !== undefined ? list.filter((x) => x !== avoid) : list
  return pool[Math.floor(rnd() * pool.length)]
}

export function pushHist(hist: HistEntry[], entry: HistEntry): HistEntry[] {
  return [entry, ...hist].slice(0, HIST_LIMIT)
}

/** Fecha local del dispositivo, YYYY-MM-DD. */
export function localDay(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function matchedToday(tip: TipState, today = localDay()): boolean {
  return tip.day === today
}

/**
 * Siguiente candidata de Tip Day: prioriza las no coleccionadas y evita la
 * actual y la última con match. Con las 40 reunidas, repite coleccionadas.
 */
export function nextTip(ids: readonly number[], tip: TipState, current: number | null, rnd: () => number = Math.random): number {
  const avoid = (i: number) => i !== current && i !== tip.last
  const fresh = ids.filter((i) => !tip.coll.includes(i) && avoid(i))
  const pool = fresh.length ? fresh : ids.filter(avoid).length ? ids.filter(avoid) : [...ids]
  return pool[Math.floor(rnd() * pool.length)]
}

export function applyMatch(tip: TipState, id: number, today = localDay()): TipState {
  if (tip.day === today) return tip // un match por día natural
  return { coll: tip.coll.includes(id) ? tip.coll : [...tip.coll, id], day: today, last: id }
}

export function seedPhrase(quien: string, grieta: string, friccion: string): string {
  return `Protagonista: ${quien}. Todo se rompe cuando ${grieta}. Y lo complica que ${friccion}.`
}
