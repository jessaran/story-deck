import ink from '../assets/flame-ink.png'
import white from '../assets/flame-white.png'

/** La mascota (Lumo). Decorativa: siempre oculta al lector de pantalla. */
export function Flame({ size, tone = 'ink', className }: { size: number; tone?: 'ink' | 'white'; className?: string }) {
  return <img src={tone === 'ink' ? ink : white} alt="" aria-hidden width={size} height={Math.round(size * 1.247)} className={className} style={{ width: size, height: 'auto', display: 'block' }} draggable={false} />
}
