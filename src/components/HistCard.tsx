import type { HistEntry } from '../lib/storage'

export function HistCard({ h, big = false }: { h: HistEntry; big?: boolean }) {
  return (
    <div className={big ? 'px-5 pb-5 pt-4' : 'px-4 pb-3.5 pt-3'} style={{ background: h.color, borderRadius: 4 }} role="group" aria-label={`${h.label}. ${h.text}`}>
      <div className="t-mono text-[8px]" style={{ opacity: 'var(--dim)' }} aria-hidden>
        {h.label}
      </div>
      <p className={`t-serif ${big ? 'mt-3 text-[20px]' : 'mt-1.5 text-[16px]'} leading-[1.25]`} aria-hidden>
        {h.text}
      </p>
    </div>
  )
}
