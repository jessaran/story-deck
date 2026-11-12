import { Star } from 'lucide-react'
import { useNavigate } from 'react-router'
import { TIP_COLOR } from '../lib/content'
import { buzz } from '../lib/haptics'

/** Botón flotante de Tip del día: una estrella sobre círculo negro, sin texto, flotando. */
export function TipFab() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label="Abrir Tip del día"
      onClick={() => {
        buzz(10)
        navigate('/tip')
      }}
      className="anim-float-tip absolute right-4 z-40 flex size-[60px] items-center justify-center rounded-full bg-ink shadow-[0_8px_18px_rgba(23,21,15,.3)] transition-transform hover:scale-105 active:scale-95"
      style={{ bottom: 'calc(var(--sab) + 20px)' }}
    >
      <Star aria-hidden size={26} strokeWidth={1.6} fill={TIP_COLOR} color={TIP_COLOR} />
    </button>
  )
}
