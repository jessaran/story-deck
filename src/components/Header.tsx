import { Info, X } from 'lucide-react'
import { Link } from 'react-router'

/** Cabecera editorial: marca, título en mayúsculas y subtítulo en serif. */
export function Header({ title, sub, color, onInfo, accent, logo, back }: { title: string; sub?: string; color: string; onInfo?: () => void; accent?: string; logo?: string; back?: boolean }) {
  return (
    <header className="relative z-20 shrink-0 border-b border-rule bg-surface px-[22px] pb-3.5" style={{ paddingTop: 'calc(var(--sat) + 14px)' }}>
      <div className="flex items-center justify-between">
        {logo ? (
          <img src={logo} alt="Story Deck" width={478} height={640} draggable={false} className="block h-[76px] w-auto" />
        ) : (
          <div className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2" style={{ background: color }} />
            <span className="font-display text-[13px] font-extrabold uppercase tracking-[-0.02em]">
              Story Deck<sup className="ml-0.5 text-[8px] font-bold text-blue">®</sup>
            </span>
          </div>
        )}
        {back && (
          <Link to="/" aria-label="Volver al mazo" className="flex size-8 items-center justify-center border border-ink/20 hover:border-ink">
            <X size={15} aria-hidden />
          </Link>
        )}
        {onInfo && (
          <button type="button" onClick={onInfo} aria-label={`Cómo funciona ${title}`} className="flex size-8 items-center justify-center border border-ink/80 bg-surface transition-colors hover:bg-ink hover:text-surface">
            <Info size={15} strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3 flex h-[46px] items-end justify-between gap-4">
        <h1 className="t-display whitespace-nowrap text-[38px]">
          {title}
          {accent && <span className="text-blue">{accent}</span>}
        </h1>
        {sub && <p className="t-serif line-clamp-3 max-w-[190px] text-right text-[12.5px] leading-[1.2] text-muted">{sub}</p>}
      </div>
    </header>
  )
}
