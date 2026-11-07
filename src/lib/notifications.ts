/**
 * Interfaz reservada para una futura versión nativa con aviso diario de Tip Day.
 * La web no puede programar notificaciones locales a hora fija sin servidor,
 * así que aquí no hay implementación activa.
 */
export interface DailyNotifier {
  isSupported(): boolean
  schedule(hour: string): Promise<void>
  cancel(): Promise<void>
}

export const notifier: DailyNotifier = {
  isSupported: () => false,
  schedule: async () => {},
  cancel: async () => {},
}
