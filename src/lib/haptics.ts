/** Vibración breve. Android la soporta; iOS no tiene la API: se ignora en silencio. */
export function buzz(ms: number) {
  try {
    // Sin un toque previo, Chrome bloquea la vibración y lo anota como error en la consola.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
    navigator.vibrate?.(ms)
  } catch {
    /* sin háptica */
  }
}
