/** Hueco punteado con una carta que sube: sustituye a cualquier texto de instrucción. */
export function GestureHint({ color }: { color: string }) {
  return (
    <div aria-hidden className="relative" style={{ width: 30, height: 44, border: '1.5px dashed rgba(23,21,15,.18)', borderRadius: 5 }}>
      <div className="anim-swipe-up absolute" style={{ inset: 3, borderRadius: 3, background: color, boxShadow: 'inset 0 0 0 1.5px #fff, 0 2px 6px rgba(23,21,15,.18)' }} />
    </div>
  )
}
