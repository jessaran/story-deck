/** Vibración breve. Android la soporta; iOS no tiene la API: se ignora en silencio. */
export function buzz(ms: number) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* sin háptica */
  }
}
