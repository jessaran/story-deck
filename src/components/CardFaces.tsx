import type { CSSProperties } from 'react'

export type Face = { label: string; text: string; color: string }

/** Tamaño del texto de carta según longitud (tabla del prototipo). */
export function cardFontSize(text: string, big: boolean) {
  const L = text.length
  if (big) return L > 190 ? 16 : L > 150 ? 18 : L > 110 ? 20 : L > 75 ? 23 : 25
  return L > 150 ? 12.5 : L > 110 ? 14 : L > 75 ? 15.5 : 17
}

export function CardBack({ color, title, label, r = 18, titleSize = 32 }: { color: string; title: string; label?: string; r?: number; titleSize?: number }) {
  return (
    <div className="card-face flex flex-col items-center justify-center" style={{ background: color, ['--r' as string]: `${r}px` } as CSSProperties} aria-hidden>
      <div className="card-back-frame" />
      {title && (
        <div className="t-display" style={{ fontSize: titleSize }}>
          {title}
        </div>
      )}
      {label && (
        <div className={`t-mono ${title ? 'mt-3' : ''} px-6 text-center text-[8px]`} style={{ opacity: 'var(--dim)' }}>
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
