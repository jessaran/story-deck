import raw from '../content.json'

export type Deck = { name: string; color: string; items: string[] }
export type Tip = { id: number; front: string; back: string; author: string; work: string | null }

export const SPARK_ORDER = ['QUIEN', 'GRIETA', 'FRICCION'] as const
export type SparkKey = (typeof SPARK_ORDER)[number] | 'YSI'
export const CRAFT_ORDER = ['PERSONAJE', 'CONFLICTO', 'MUNDO', 'RELACION', 'OFICIO'] as const
export type CraftKey = (typeof CRAFT_ORDER)[number]

export const spark = raw.spark as Record<SparkKey, Deck>
export const craft = raw.craft as Record<CraftKey, Deck>
export const breakCards: string[] = raw.break
export const tips: Tip[] = raw.tipDay as Tip[]

export const BREAK_COLOR = '#FF9B7A'
export const TIP_COLOR = '#CBB6FF'
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
