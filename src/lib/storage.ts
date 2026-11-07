export const STORE_KEY = 'storydeck.v3'
export const STORE_VERSION = 3

export type HistEntry = { label: string; text: string; color: string }
export type TipState = { coll: number[]; day: string | null; last: number | null }
export type AppState = {
  version: 3
  name: string
  draws: number
  hist: HistEntry[]
  tip: TipState
  onboarded: boolean
}

export const emptyState = (): AppState => ({
  version: STORE_VERSION,
  name: '',
  draws: 0,
  hist: [],
  tip: { coll: [], day: null, last: null },
  onboarded: false,
})

const isStr = (v: unknown): v is string => typeof v === 'string'
const isInt = (v: unknown): v is number => Number.isInteger(v)

/** Lo leído del navegador no es de fiar: se valida campo a campo. */
export function sanitize(input: unknown): AppState {
  const s = emptyState()
  if (!input || typeof input !== 'object') return s
  const o = input as Record<string, unknown>
  if (isStr(o.name)) s.name = o.name.slice(0, 60)
  if (isInt(o.draws) && o.draws >= 0) s.draws = o.draws
  if (Array.isArray(o.hist))
    s.hist = o.hist
      .filter((h): h is HistEntry => !!h && isStr(h.label) && isStr(h.text) && isStr(h.color))
      .map(({ label, text, color }) => ({ label, text, color }))
      .slice(0, 5)
  const t = o.tip as Record<string, unknown> | undefined
  if (t && typeof t === 'object') {
    if (Array.isArray(t.coll)) s.tip.coll = [...new Set(t.coll.filter(isInt))]
    if (isStr(t.day) && /^\d{4}-\d{2}-\d{2}$/.test(t.day)) s.tip.day = t.day
    if (isInt(t.last)) s.tip.last = t.last
  }
  s.onboarded = o.onboarded === true
  return s
}

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>

function readJSON(ls: Storage, key: string): unknown {
  try {
    const raw = ls.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Carga el almacén. Migra, por orden: storydeck.v3 → lumo.v3 (mismo formato)
 * → claves sueltas del prototipo (lumo.deck.v2 / lumo.tip.v1 / lumo.onb.v1).
 */
export function load(ls: Storage | undefined = safeLocalStorage()): AppState {
  if (!ls) return emptyState()
  const current = readJSON(ls, STORE_KEY) ?? readJSON(ls, 'lumo.v3')
  if (current) return sanitize(current)

  const deck = readJSON(ls, 'lumo.deck.v2') as Record<string, unknown> | null
  const tip = readJSON(ls, 'lumo.tip.v1') as Record<string, unknown> | null
  const onb = readJSON(ls, 'lumo.onb.v1') as Record<string, unknown> | null
  if (!deck && !tip && !onb) return emptyState()
  // El prototipo guardaba índices 0-based; content.json usa ids 1-based.
  const toId = (v: unknown) => (isInt(v) ? v + 1 : v)
  const migrated = sanitize({
    ...deck,
    tip: tip && {
      ...tip,
      coll: Array.isArray(tip.coll) ? tip.coll.map(toId) : [],
      last: toId(tip.last),
    },
    onboarded: onb?.done === true,
  })
  save(migrated, ls)
  return migrated
}

/** Devuelve false si el navegador no deja guardar (modo privado, cuota llena). */
export function save(state: AppState, ls: Storage | undefined = safeLocalStorage()): boolean {
  if (!ls) return false
  try {
    ls.setItem(STORE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}
