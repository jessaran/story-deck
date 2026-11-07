import type { CSSProperties } from 'react'
import { Mascot } from './Mascot'

export type Face = { label: string; text: string; color: string }

/** Tamaño del texto de carta según longitud (tabla del prototipo). */
export function cardFontSize(text: string, big: boolean) {
  const L = text.length
  if (big) return L > 190 ? 16 : L > 150 ? 18 : L > 110 ? 20 : L > 75 ? 23 : 25
  return L > 150 ? 12.5 : L > 110 ? 14 : L > 75 ? 15.5 : 17
}

export function CardBack({ color, title, label, r = 18, markSize = 56, titleSize = 32 }: { color: string; title: string; label?: string; r?: number; markSize?: number; titleSize?: number }) {
  return (
    <div className="card-face flex flex-col items-center justify-center" style={{ background: color, ['--r' as string]: `${r}px` } as CSSProperties} aria-hidden>
      <div className="card-back-frame" />
      <Mascot size={markSize} />
      <div className="t-display mt-2.5" style={{ fontSize: titleSize }}>
        {title}
      </div>
      {label && (
        <div className="t-mono mt-3 text-[8px] text-center px-6" style={{ opacity: 'var(--dim)' }}>
          {label}
        </div>
      )}
    </div>
  )
}

export function CardFront({ face, r = 18, pad = 22, big = true, back = false, hidden = false, style, children }: { face: Face; r?: number; pad?: number; big?: boolean; back?: boolean; hidden?: boolean; style?: CSSProperties; children?: React.ReactNode }) {
  return (
    <div
      className="card-face flex flex-col text-ink"
      style={{ background: face.color, padding: pad, transform: back ? 'rotateY(180deg)' : undefined, ['--r' as string]: `${r}px`, ...style } as CSSProperties}
      role={hidden ? undefined : 'img'}
      aria-label={hidden ? undefined : `${face.label}. ${face.text}`}
      aria-hidden={hidden || undefined}
    >
      <div className="t-mono text-[8.5px]" style={{ opacity: 'var(--dim)' }} aria-hidden>
        {face.label}
      </div>
      <p className="t-serif mt-auto" style={{ fontSize: cardFontSize(face.text, big), lineHeight: 1.22 }} aria-hidden>
        {face.text}
      </p>
      {children}
    </div>
  )
}
