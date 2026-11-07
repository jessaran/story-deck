export type Pt = { x: number; y: number }

/** ¿El trazo cuenta como corte diagonal? Largo suficiente y entre 20° y 70° respecto a la horizontal. */
export function isDiagonalCut(a: Pt, b: Pt, minLen: number): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.hypot(dx, dy) < minLen) return false
  const deg = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI
  return deg >= 20 && deg <= 70
}

/**
 * Parte el rectángulo w×h por la recta que pasa por a y b (Sutherland–Hodgman
 * contra cada semiplano). Devuelve los dos polígonos y la normal unitaria que
 * apunta hacia el primero, para separar las mitades.
 */
export function splitRect(w: number, h: number, a: Pt, b: Pt): { left: Pt[]; right: Pt[]; normal: Pt } {
  const d = { x: b.x - a.x, y: b.y - a.y }
  const side = (p: Pt) => d.x * (p.y - a.y) - d.y * (p.x - a.x)
  const rect: Pt[] = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]
  const clip = (sign: 1 | -1) => {
    const out: Pt[] = []
    rect.forEach((p, i) => {
      const q = rect[(i + 1) % rect.length]
      const sp = side(p) * sign
      const sq = side(q) * sign
      if (sp >= 0) out.push(p)
      if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
        const t = sp / (sp - sq)
        out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
      }
    })
    return out
  }
  const len = Math.hypot(d.x, d.y) || 1
  return { left: clip(1), right: clip(-1), normal: { x: -d.y / len, y: d.x / len } }
}

export const toClipPath = (poly: Pt[], w: number, h: number) =>
  `polygon(${poly.map((p) => `${((p.x / w) * 100).toFixed(2)}% ${((p.y / h) * 100).toFixed(2)}%`).join(', ')})`
