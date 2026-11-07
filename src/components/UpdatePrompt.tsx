import { useRegisterSW } from 'virtual:pwa-register/react'

/** Aviso discreto cuando hay una versión nueva; revisa cada hora para no quedarse obsoleta. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
    },
  })
  if (!needRefresh) return null
  return (
    <div role="status" className="anim-fade-in absolute inset-x-3 z-[100] flex items-center gap-3 bg-ink px-4 py-3 text-surface" style={{ top: 'calc(var(--sat) + 8px)' }}>
      <span className="flex-1 text-[13px] font-medium">Hay una versión nueva de Story Deck.</span>
      <button type="button" className="t-ui text-[10.5px] text-tip" onClick={() => updateServiceWorker(true)}>
        Actualizar
      </button>
      <button type="button" className="t-ui text-[10.5px] text-surface/60" onClick={() => setNeedRefresh(false)}>
        Luego
      </button>
    </div>
  )
}
