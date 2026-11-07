import { describe, expect, it } from 'vitest'
import { isDiagonalCut, splitRect } from './slice'

const area = (p: { x: number; y: number }[]) => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a.x * b.y - b.x * a.y }, 0)) / 2

describe('corte del logo', () => {
  it('solo acepta trazos diagonales y largos', () => {
    expect(isDiagonalCut({ x: 0, y: 0 }, { x: 200, y: 200 }, 120)).toBe(true)
    expect(isDiagonalCut({ x: 200, y: 0 }, { x: 0, y: 180 }, 120)).toBe(true)
    expect(isDiagonalCut({ x: 0, y: 0 }, { x: 300, y: 10 }, 120)).toBe(false) // horizontal
    expect(isDiagonalCut({ x: 0, y: 0 }, { x: 10, y: 300 }, 120)).toBe(false) // vertical
    expect(isDiagonalCut({ x: 0, y: 0 }, { x: 50, y: 50 }, 120)).toBe(false) // corto
  })

  it('las dos mitades cubren el rectángulo entero', () => {
    const { left, right, normal } = splitRect(400, 300, { x: 0, y: 300 }, { x: 400, y: 0 })
    expect(area(left) + area(right)).toBeCloseTo(400 * 300)
    expect(area(left)).toBeCloseTo(60000)
    expect(Math.hypot(normal.x, normal.y)).toBeCloseTo(1)
  })

  it('una recta que no corta deja una mitad vacía', () => {
    const { left, right } = splitRect(100, 100, { x: -50, y: -10 }, { x: -10, y: -50 })
    expect(Math.min(area(left), area(right))).toBe(0)
  })
})
