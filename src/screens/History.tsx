import { Header } from '../components/Header'
import { HistCard } from '../components/HistCard'
import { useStore } from '../state/store'

export function History() {
  const { state } = useStore()
  return (
    <>
      <Header title="Últimas" sub="Las cinco cartas más recientes." color="#17150F" />
      <main className="anim-stage-in min-h-0 flex-1 overflow-y-auto px-[22px] py-5" aria-label="Últimas tiradas">
        {state.hist.length ? (
          <ol className="flex flex-col gap-2.5">
            {state.hist.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-display w-7 shrink-0 pt-3 text-[18px] font-extrabold text-muted3">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <HistCard h={h} big />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="t-serif pt-6 text-[20px] text-muted">Aún no has robado ninguna carta.</p>
        )}
      </main>
    </>
  )
}
