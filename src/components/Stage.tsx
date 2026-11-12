import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export const CANVAS_W = 402
export const CANVAS_H = 650

/**
 * Lienzo de 402 × 650 (viewport de referencia sin cabecera ni barra) que escala
 * con el espacio disponible. Así el mazo ocupa exactamente la misma posición en
 * los cuatro modos y en cualquier pantalla.
 */
/** `canvas`: lienzo más pequeño = todo se ve más grande (Tip del día). */
export function Stage({ children, scroll = false, label, canvas = { w: CANVAS_W, h: CANVAS_H, max: 1.12 } }: { children: ReactNode; scroll?: boolean; label?: string; canvas?: { w: number; h: number; max: number } }) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setZoom(Math.min(el.clientWidth / canvas.w, el.clientHeight / canvas.h, canvas.max)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [canvas.w, canvas.h, canvas.max])
  return (
    <main ref={ref} aria-label={label} className={`relative min-h-0 flex-1 overflow-x-hidden ${scroll ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>
      <div className="anim-stage-in relative mx-auto" style={{ width: canvas.w, minHeight: canvas.h, zoom }}>
        {children}
      </div>
    </main>
  )
}
