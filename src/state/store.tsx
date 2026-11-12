import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { applyMatch, pushHist } from '../lib/rules'
import { emptyState, load, save, wipe, type AppState, type HistEntry } from '../lib/storage'

type Store = {
  state: AppState
  /** false si el navegador no deja guardar (modo privado estricto, cuota llena). */
  persisted: boolean
  finishOnboarding: (name: string) => void
  logCard: (entry: HistEntry) => void
  clearHist: () => void
  /** Borra nombre, contador, historial y colección: la app vuelve a la bienvenida. */
  wipeAll: () => void
  matchTip: (id: number) => void
  announce: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load())
  const [persisted, setPersisted] = useState(true)
  const [live, setLive] = useState('')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setPersisted(save(state))
  }, [state])

  const finishOnboarding = useCallback((name: string) => setState((s) => ({ ...s, name: name.trim().slice(0, 60), onboarded: true })), [])
  const logCard = useCallback((entry: HistEntry) => setState((s) => ({ ...s, draws: s.draws + 1, hist: pushHist(s.hist, entry) })), [])
  // Borrar tiradas no toca el contador ni la colección de Tip Day.
  const clearHist = useCallback(() => setState((s) => ({ ...s, hist: [] })), [])
  const wipeAll = useCallback(() => {
    wipe()
    first.current = true // no volver a escribir el estado vacío recién borrado
    setState(emptyState())
  }, [])
  const matchTip = useCallback((id: number) => setState((s) => ({ ...s, tip: applyMatch(s.tip, id) })), [])
  const announce = useCallback((msg: string) => {
    setLive('')
    requestAnimationFrame(() => setLive(msg))
  }, [])

  const value = useMemo(
    () => ({ state, persisted, finishOnboarding, logCard, clearHist, wipeAll, matchTip, announce }),
    [state, persisted, finishOnboarding, logCard, clearHist, wipeAll, matchTip, announce],
  )
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="sr-only">
        {live}
      </div>
    </Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fuera de StoreProvider')
  return s
}
