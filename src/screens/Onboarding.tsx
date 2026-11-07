import { useState } from 'react'
import { Flame } from '../components/Flame'
import { InstallSheet } from '../components/Sheets'
import { buzz } from '../lib/haptics'
import { useStore } from '../state/store'

function isIosSafariNotInstalled() {
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches
  return ios && !standalone && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

export function Onboarding() {
  const { finishOnboarding } = useStore()
  const [name, setName] = useState('')
  const [install, setInstall] = useState(false)
  const ready = name.trim().length > 0
  const showInstall = isIosSafariNotInstalled()

  return (
    <form
      className="anim-fade-in flex h-full flex-col bg-surface px-[26px]"
      style={{ paddingTop: 'calc(var(--sat) + 44px)', paddingBottom: 'calc(var(--sab) + 26px)' }}
      onSubmit={(e) => {
        e.preventDefault()
        if (!ready) return
        buzz(14)
        finishOnboarding(name)
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="anim-float-mascot">
          <Flame size={71} />
        </div>
        <div className="t-mono mt-6 text-[9px] tracking-[0.24em] text-muted2">Hola, soy Lumo</div>
        <h1 className="t-display mt-3 text-[44px]">
          Bienvenida
          <br />
          al <span className="text-blue">mazo.</span>
        </h1>
        <p className="t-serif mt-4 max-w-[320px] text-[18px] leading-[1.3] text-muted">Te ayudaré con tus bloqueos, te daré tips de escritura y haremos brainstorming para que la creatividad fluya.</p>

        <label htmlFor="name" className="t-label mt-9 self-start">
          ¿Cómo te llamas?
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="given-name"
          maxLength={60}
          enterKeyHint="go"
          className="mt-3 w-full border-b-2 border-ink bg-transparent pb-2 text-left font-sans text-[22px] font-bold outline-none placeholder:text-muted3 focus-visible:border-blue focus-visible:outline-none"
        />
        <p className="t-serif mt-6 self-start text-left text-[15px] text-muted2">Tip Day te espera cada día en el botón de la llama.</p>
        {showInstall && (
          <button type="button" onClick={() => setInstall(true)} className="t-ui mt-3 self-start border border-ink/30 px-3 py-2 text-[9.5px] text-muted">
            Instálala en tu pantalla de inicio ↗
          </button>
        )}
      </div>
      <button type="submit" disabled={!ready} className="btn btn-primary mt-6 w-full shrink-0">
        Entrar al mazo →
      </button>
      <InstallSheet open={install} onClose={() => setInstall(false)} />
    </form>
  )
}
