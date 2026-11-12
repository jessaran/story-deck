import { useSyncExternalStore } from 'react'

/** Pantalla ancha y horizontal (ordenador o tablet tumbada): se usa la maqueta de escritorio. */
export const WIDE_QUERY = '(min-width: 900px) and (orientation: landscape)'

export function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(WIDE_QUERY)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => matchMedia(WIDE_QUERY).matches,
  )
}
