import { useNavigate } from 'react-router'
import { buzz } from '../lib/haptics'
import { Flame } from './Flame'

/** Botón flotante de Tip Day: la mascota, sin texto, flotando. */
export function TipFab() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label="Abrir Tip Day"
      onClick={() => {
        buzz(10)
        navigate('/tip')
      }}
      className="anim-float-tip absolute right-5 z-40 flex size-16 items-center justify-center rounded-full bg-ink shadow-[0_10px_24px_rgba(23,21,15,.3)] transition-colors hover:bg-blue"
      style={{ bottom: 'calc(var(--sab) + 58px + 16px)' }}
    >
      <Flame size={28} tone="white" />
    </button>
  )
}
