import { useNavigate } from 'react-router'
import { buzz } from '../lib/haptics'
import fab from '../assets/tip-fab.webp'

/** Botón flotante de Tip Day: el pato sobre el círculo azul, sin texto, flotando. */
export function TipFab({ bottom }: { bottom: number }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label="Abrir Tip Day"
      onClick={() => {
        buzz(10)
        navigate('/tip')
      }}
      className="anim-float-tip absolute right-3 z-40 block w-[76px] transition-transform hover:scale-105 active:scale-95"
      style={{ bottom }}
    >
      <img src={fab} alt="" aria-hidden draggable={false} width={240} height={217} className="block h-auto w-full drop-shadow-[0_8px_14px_rgba(23,21,15,.28)]" />
    </button>
  )
}
