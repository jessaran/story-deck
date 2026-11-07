import raw from '../content.json'

export type Deck = { name: string; color: string; items: string[] }
export type Tip = { id: number; front: string; back: string; author: string; work: string | null }

export const SPARK_ORDER = ['QUIEN', 'GRIETA', 'FRICCION'] as const
export type SparkKey = (typeof SPARK_ORDER)[number] | 'YSI'
export const CRAFT_ORDER = ['PERSONAJE', 'CONFLICTO', 'MUNDO', 'RELACION', 'OFICIO'] as const
export type CraftKey = (typeof CRAFT_ORDER)[number]

/** Todas las cartas en azules distintos (branding jessaran.com). Los textos siguen viniendo de content.json. */
export const PALETTE = {
  spark: '#8EB0FF',
  craft: '#7FA0FF',
  break: '#5E7EFF',
  tip: '#AFC2FF',
  QUIEN: '#BCD0FF',
  GRIETA: '#A3BCFF',
  FRICCION: '#D3E0FF',
  YSI: '#8FD8FF',
  PERSONAJE: '#C2CDFF',
  CONFLICTO: '#6C8BFF',
  MUNDO: '#A8DCFF',
  RELACION: '#B7B4FF',
  OFICIO: '#93ADF0',
} as const

const recolor = <K extends keyof typeof PALETTE>(decks: Record<string, Deck>) =>
  Object.fromEntries(Object.entries(decks).map(([k, d]) => [k, { ...d, color: PALETTE[k as K] ?? d.color }]))

export const spark = recolor(raw.spark) as Record<SparkKey, Deck>
export const craft = recolor(raw.craft) as Record<CraftKey, Deck>
export const breakCards: string[] = raw.break
export const tips: Tip[] = raw.tipDay as Tip[]

export const BREAK_COLOR = PALETTE.break
export const TIP_COLOR = PALETTE.tip
/** Cartas de tirada (Spark + Craft + Break). Tip Day va aparte. */
export const DRAW_DECK_SIZE =
  Object.values(spark).reduce((n, d) => n + d.items.length, 0) +
  Object.values(craft).reduce((n, d) => n + d.items.length, 0) +
  breakCards.length

/** «Autor · Obra»; las atribuidas se muestran como «atribuido a …». */
export function tipCredit(t: Tip): string {
  if (t.work === 'atribuido') return `atribuido a ${t.author}`
  return t.work ? `${t.author} · ${t.work}` : t.author
}
