import { NavLink } from 'react-router'
import { buzz } from '../lib/haptics'

const ITEMS = [
  ['/', 'Inicio'],
  ['/spark', 'Spark'],
  ['/craft', 'Craft'],
  ['/break', 'Break'],
] as const

export function NavBar() {
  return (
    <nav aria-label="Modos" className="relative z-30 shrink-0 border-t border-rule bg-surface" style={{ paddingBottom: 'var(--sab)' }}>
      <ul className="flex h-[58px] items-stretch justify-around px-3">
        {ITEMS.map(([to, label]) => (
          <li key={to} className="flex">
            <NavLink
              to={to}
              end
              onClick={() => buzz(8)}
              className={({ isActive }) =>
                `t-ui relative flex min-w-[64px] items-center justify-center text-[11.5px] transition-colors ${isActive ? 'text-ink after:absolute after:bottom-3 after:left-1/2 after:h-[2px] after:w-8 after:-translate-x-1/2 after:bg-blue' : 'text-muted2 hover:text-ink'}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
