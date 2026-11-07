import ink from '../assets/glyph-ink.png'
import white from '../assets/glyph-white.png'

/** Gafas y pico del patito (el mismo glifo del icono). Decorativo: oculto al lector de pantalla. */
export function Mascot({ size, tone = 'ink', className }: { size: number; tone?: 'ink' | 'white'; className?: string }) {
  return <img src={tone === 'ink' ? ink : white} alt="" aria-hidden width={240} height={135} className={className} style={{ width: size, height: 'auto', display: 'block' }} draggable={false} />
}
