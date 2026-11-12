import { X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Drawer } from 'vaul'
import { DRAW_DECK_SIZE, PALETTE } from '../lib/content'
import { buzz } from '../lib/haptics'
import { MODES, type ModeKey } from '../lib/modes'
import { useStore } from '../state/store'
import { Mascot } from './Mascot'
import duck from '../assets/tip-fab.webp'
import { HistCard } from './HistCard'

function Sheet({ open, onClose, top, title, children }: { open: boolean; onClose: () => void; top: number; title: string; children: ReactNode }) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-ink/50" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[90] mx-auto flex max-w-[430px] flex-col overflow-hidden bg-surface outline-none"
          style={{ top: `calc(var(--sat) + ${top}px)`, borderRadius: '22px 22px 0 0' }}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function CloseBtn({ onClose, dark = true }: { onClose: () => void; dark?: boolean }) {
  return (
    <button type="button" onClick={onClose} aria-label="Cerrar" className={`flex size-8 shrink-0 items-center justify-center ${dark ? 'bg-ink text-surface' : 'border border-ink'}`}>
      <X size={15} strokeWidth={2.2} aria-hidden />
    </button>
  )
}

const Grabber = () => <div aria-hidden className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-ink/20" />

export function TutorialSheet({ mode, onClose }: { mode: ModeKey | null; onClose: () => void }) {
  const navigate = useNavigate()
  const [last, setLast] = useState<ModeKey>('spark')
  if (mode && mode !== last) setLast(mode)
  const m = MODES[mode ?? last]
  return (
    <Sheet open={!!mode} onClose={onClose} top={96} title={`Cómo funciona ${m.title}`}>
      <div className="relative shrink-0 px-[22px] pb-5 pt-6" style={{ background: m.color }}>
        <Grabber />
        <div className="flex items-start justify-between">
          <div>
            <div className="t-mono text-[8.5px]" style={{ opacity: 'var(--dim)' }}>
              {m.mech}
            </div>
            <div className="t-display mt-2.5 text-[38px]">{m.title}</div>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
      </div>
      <ol className="flex-1 overflow-y-auto px-[22px] py-5" data-vaul-no-drag>
        {m.steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4 border-b border-rule py-4 first:pt-1 last:border-0">
            <span className="font-display w-7 shrink-0 text-[20px] font-extrabold leading-none text-blue">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div className="font-sans text-[15px] font-bold leading-tight">{t}</div>
              <p className="mt-1.5 text-[13.5px] font-medium leading-[1.5] text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="shrink-0 px-[22px] pt-2" style={{ paddingBottom: 'calc(var(--sab) + 18px)' }}>
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => {
            onClose()
            navigate(`/${mode ?? last}`)
          }}
        >
          Abrir {m.title} →
        </button>
      </div>
    </Sheet>
  )
}

export function AccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, persisted, clearHist } = useStore()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const close = () => {
    setConfirm(false)
    onClose()
  }
  return (
    <Sheet open={open} onClose={close} top={120} title="Cuenta local">
      <div className="relative flex-1 overflow-y-auto px-[22px] pt-6" style={{ paddingBottom: 'calc(var(--sab) + 24px)' }} data-vaul-no-drag>
        <Grabber />
        <div className="flex items-start justify-between">
          <div>
            <div className="t-eyebrow">Cuenta local</div>
            <div className="t-display mt-2 text-[34px]">{state.name || 'Sin nombre'}</div>
          </div>
          <CloseBtn onClose={close} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {[
            [state.draws, 'Cartas robadas', PALETTE.spark],
            [DRAW_DECK_SIZE, 'Cartas en el mazo', PALETTE.craft],
          ].map(([n, l, c]) => (
            <div key={l} className="px-4 pb-3.5 pt-4" style={{ background: c as string }}>
              <div className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em]">{n}</div>
              <div className="t-mono mt-3 text-[8px]" style={{ opacity: 'var(--dim)' }}>
                {l}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 bg-slate px-4 py-4 text-surface">
          <div className="flex items-center gap-2.5">
            <Mascot size={24} tone="white" />
            <div className="t-mono text-[8.5px] text-surface/80">Funciona sin conexión</div>
          </div>
          <p className="t-serif mt-2.5 text-[16px] leading-[1.3]">El mazo es fijo y vive dentro de la app. Tus tiradas se guardan solo en este teléfono: sin cuenta, sin servidor, sin sincronizar.</p>
        </div>
        {!persisted && (
          <p role="alert" className="mt-2.5 border border-break px-4 py-3 text-[13px] font-medium text-muted">
            Este navegador no deja guardar datos (¿modo privado?). Tus tiradas se perderán al cerrar.
          </p>
        )}

        <div className="mt-7 flex items-center justify-between">
          <div className="t-label">Últimas tiradas</div>
          {state.hist.length > 0 && (
            <button
              type="button"
              className="t-ui text-[10.5px] text-blue"
              onClick={() => {
                close()
                navigate('/ultimas')
              }}
            >
              Ver todas →
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {state.hist.length ? state.hist.slice(0, 3).map((h, i) => <HistCard key={i} h={h} />) : <p className="t-serif py-3 text-[16px] text-muted">Aún no has robado ninguna carta.</p>}
        </div>

        <div className="mt-5">
          {confirm ? (
            <div className="border border-ink p-4" role="alertdialog" aria-label="Confirmar borrado">
              <p className="text-[13.5px] font-medium leading-snug">¿Borrar tus últimas tiradas? El contador de cartas robadas y tu colección de Tip Day se mantienen.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    buzz(14)
                    clearHist()
                    setConfirm(false)
                  }}
                >
                  Sí, borrar
                </button>
                <button type="button" className="btn btn-ghost flex-1" onClick={() => setConfirm(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost w-full" disabled={!state.hist.length} onClick={() => setConfirm(true)}>
              Borrar mis últimas tiradas
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}

export function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} top={420} title="Instálala en tu pantalla de inicio">
      <div className="relative px-[22px] pt-6" style={{ paddingBottom: 'calc(var(--sab) + 24px)' }}>
        <Grabber />
        <div className="flex items-start justify-between">
          <div className="t-display text-[26px]">Instálala</div>
          <CloseBtn onClose={onClose} />
        </div>
        <ol className="mt-4">
          {['En Safari, toca el botón Compartir (el cuadrado con la flecha).', 'Elige «Añadir a pantalla de inicio» y confirma.'].map((t, i) => (
            <li key={t} className="flex gap-4 border-b border-rule py-3.5 last:border-0">
              <span className="font-display w-7 shrink-0 text-[20px] font-extrabold leading-none text-blue">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-[14px] font-medium leading-snug">{t}</p>
            </li>
          ))}
        </ol>
      </div>
    </Sheet>
  )
}

export function AboutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} top={440} title="Sobre Story Deck">
      <div className="relative px-[22px] pt-6" style={{ paddingBottom: 'calc(var(--sab) + 24px)' }}>
        <Grabber />
        <div className="flex items-start justify-between">
          <div className="t-eyebrow">Sobre Story Deck</div>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <img src={duck} alt="" aria-hidden draggable={false} width={240} height={217} className="block h-auto w-[96px] shrink-0" />
          <p className="t-serif text-[17px] leading-[1.3]">Escribo guiones y dirijo. Juego con código y programo cosas que no tengo ni idea de cómo programar porque tengo TDAH.</p>
        </div>
        <a href="https://jessaran.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full">
          jessaran.com ↗
        </a>
      </div>
    </Sheet>
  )
}
