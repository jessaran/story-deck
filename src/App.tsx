import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { NavBar } from './components/NavBar'
import { TipFab } from './components/TipFab'
import { UpdatePrompt } from './components/UpdatePrompt'
import { Break } from './screens/Break'
import { Craft } from './screens/Craft'
import { History } from './screens/History'
import { Lab } from './screens/Lab'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Spark } from './screens/Spark'
import { TipDay } from './screens/TipDay'
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
          <Route path="/spark" element={<Spark />} />
          <Route path="/craft" element={<Craft />} />
          <Route path="/break" element={<Break />} />
          <Route path="/tip" element={<TipDay />} />
          <Route path="/ultimas" element={<History />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {pathname === '/' && <TipFab />}
      {pathname !== '/lab' && <NavBar />}
    </>
  )
}

export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="relative mx-auto flex h-full max-w-[430px] flex-col overflow-hidden bg-surface shadow-[0_0_0_1px_rgba(23,21,15,.06)]">
          <Shell />
          <UpdatePrompt />
        </div>
      </HashRouter>
    </StoreProvider>
  )
}
