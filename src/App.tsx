import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { TipFab } from './components/TipFab'
import { UpdatePrompt } from './components/UpdatePrompt'
import { History } from './screens/History'
import { Home } from './screens/Home'
import { IntroLab } from './screens/IntroLab'
import { Lab } from './screens/Lab'
import { Onboarding } from './screens/Onboarding'
import { TipDay } from './screens/TipDay'
import { useWide } from './lib/useWide'
import { StoreProvider, useStore } from './state/store'

function Shell() {
  const { state } = useStore()
  const { pathname } = useLocation()
  if (!state.onboarded) return <Onboarding />
  return (
    <>
      {/* key: cada cambio de modo reinicia la pantalla y su entrada */}
      <div key={pathname} className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spark" element={<Lab start="spark" />} />
          <Route path="/craft" element={<Lab start="craft" />} />
          <Route path="/break" element={<Lab start="break" />} />
          <Route path="/tip" element={<TipDay />} />
          <Route path="/intro" element={<IntroLab />} />
          <Route path="/ultimas" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {/* Tip Day solo flota en el inicio */}
      {pathname === '/' && <TipFab />}
    </>
  )
}

export function App() {
  const wide = useWide()
  return (
    <StoreProvider>
      <HashRouter>
        <div className={`relative mx-auto flex h-full flex-col overflow-hidden bg-surface ${wide ? 'w-full' : 'max-w-[430px] shadow-[0_0_0_1px_rgba(23,21,15,.06)]'}`}>
          <Shell />
          <UpdatePrompt />
        </div>
      </HashRouter>
    </StoreProvider>
  )
}
