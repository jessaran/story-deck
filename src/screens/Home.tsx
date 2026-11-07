import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Header } from '../components/Header'
import { AccountSheet, TutorialSheet } from '../components/Sheets'
import { Stage } from '../components/Stage'
import { buzz } from '../lib/haptics'
import { MODES, type ModeKey } from '../lib/modes'
import { useStore } from '../state/store'

export function Home() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [tut, setTut] = useState<ModeKey | null>(null)
  const [account, setAccount] = useState(false)
  const keys: ModeKey[] = ['spark', 'craft', 'break']

  return (
    <>
      <Header title={state.name ? 'Hola, ' : 'Hola'} accent={state.name || undefined} sub="Tres tiradas para tres momentos de escritura." color="#17150F" />
      <Stage label="Inicio">
        <div className="px-[22px] pt-3.5">
          <button
            type="button"
            onClick={() => {
              buzz(8)
              setAccount(true)
            }}
            className="group flex w-full items-center gap-3 border-y border-rule py-3 text-left"
            aria-label={`Cuenta de ${state.name || 'usuario'}: ${state.draws} cartas robadas`}
          >
            <span aria-hidden className="t-serif flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-[21px] text-surface">
              {(state.name.trim()[0] ?? 'l').toLowerCase()}
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-bold leading-none">{state.name || 'Tu cuenta'}</span>
              <span className="t-mono mt-1.5 block text-[8.5px] tracking-[0.14em] text-muted2">{state.draws} cartas robadas</span>
            </span>
            <ArrowRight aria-hidden size={17} className="text-muted2 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
          </button>

          <h2 className="t-label mb-3 mt-6">Elige una tirada</h2>
          <div className="flex flex-col">
            {keys.map((k, i) => {
              const m = MODES[k]
              const last = i === keys.length - 1
              return (
                <div
                  key={k}
                  className="relative cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                  style={{ background: m.color, marginTop: i ? -26 : 0, zIndex: i + 1, padding: `18px 18px ${last ? 22 : 44}px`, borderRadius: 6, boxShadow: '0 -6px 18px rgba(23,21,15,.10), inset 0 0 0 1px rgba(255,255,255,.5)' }}
                  onClick={() => {
                    buzz(10)
                    navigate(`/${k}`)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="t-mono text-[8.5px] tracking-[0.16em]" style={{ opacity: 'var(--dim)' }}>
                        {String(i + 1).padStart(2, '0')} — {m.mech}
                      </div>
                      <h3 className="t-display mt-2 text-[30px]">
                        <a
                          href={`#/${k}`}
                          onClick={(e) => e.preventDefault()}
                          className="outline-offset-4 after:absolute after:inset-0 after:content-['']"
                          aria-label={`Abrir ${m.title}`}
                        >
                          {m.title}
                        </a>
                      </h3>
                    </div>
                    <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center bg-ink text-surface">
                      <ArrowUpRight size={17} strokeWidth={2.2} />
                    </span>
                  </div>
                  <p className="t-serif mt-2 max-w-[290px] text-[15px] leading-[1.25]">{m.sub}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      buzz(8)
                      setTut(k)
                    }}
                    className="t-ui relative z-10 mt-3 inline-flex h-[30px] items-center border border-ink/70 px-3 text-[9.5px] transition-colors hover:bg-ink hover:text-surface"
                  >
                    Cómo funciona
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </Stage>
      <TutorialSheet mode={tut} onClose={() => setTut(null)} />
      <AccountSheet open={account} onClose={() => setAccount(false)} />
    </>
  )
}
