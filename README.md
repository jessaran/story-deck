# Story Deck

Un mazo de cartas para desatascar la escritura. Web app instalable (PWA): sin cuenta, sin servidor, funciona sin conexión.

**App:** https://jessaran.github.io/story-deck/

- **Spark**: tres cartas (QUIÉN → GRIETA → FRICCIÓN) que forman una frase-semilla, más una Y SI… opcional.
- **Craft**: una carta de la categoría que elijas (Personaje, Conflicto, Mundo, Relación, Oficio).
- **Break**: una carta, ya.
- **Tip del día** (estrella flotante del inicio): una carta de oficio al día. Swipe izquierda descarta, derecha hace match. Un match por día.

Todo el contenido está en [`src/content.json`](src/content.json) (69 cartas de tirada + 40 tips). Todo el estado se guarda en el navegador (`localStorage`, clave `storydeck.v3`).

## Instalarla en el móvil

**iPhone (Safari):** abre el enlace → botón Compartir (cuadrado con flecha) → «Añadir a pantalla de inicio».

**Android (Chrome):** abre el enlace → menú ⋮ → «Instalar aplicación» (o «Añadir a pantalla de inicio»).

Tras la primera visita funciona sin conexión. Cuando se publica una versión nueva, la app muestra un aviso «Actualizar».

## Privacidad y seguridad

- Sin cuentas, sin servidor propio, sin cookies. Tipografías, imágenes y cartas van dentro de la app.
- Estadísticas de visitas con [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/): anónimas, sin cookies y sin identificar a nadie. Es lo único que sale de la app, y solo en la versión publicada (no en `npm run dev`). Los bloqueadores de anuncios pueden frenarlo.
  - El sitio de Cloudflare es `jessaran.github.io`, que comparten todos los proyectos de GitHub Pages de la cuenta. El token (en `vite.config.ts`) es **solo para Story Deck**: no lo reutilices en otro proyecto. Si algún día otro proyecto de `jessaran.github.io` usa el mismo token, filtra en el panel por ruta que empieza por `/story-deck/`.
- Lo único que se guarda es tu nombre, el contador, las 5 últimas tiradas y la colección de Tip del día, en el `localStorage` de tu navegador (clave `storydeck.v3`). Se valida al leerlo.
- Desde la cuenta se puede borrar el historial o **todos los datos** del dispositivo.
- En producción, una política de seguridad de contenido (CSP) solo permite recursos del propio sitio y de Cloudflare Web Analytics, y `referrer` está en `no-referrer`. El enlace a jessaran.com se abre con `noopener noreferrer`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/story-deck/
npm run test     # reglas de negocio y almacén
npm run build    # comprueba tipos y genera dist/
```

Cada push a `main` ejecuta los tests, compila y publica en GitHub Pages (`.github/workflows/deploy.yml`).

## Estructura

```
src/
  content.json        contenido definitivo (no editar textos)
  lib/                reglas (rules.ts), almacén y migraciones (storage.ts), contenido, modos
  state/store.tsx     estado global persistido + anuncios accesibles
  components/         Deck (pila, arrastre, lanzamiento, giro), caras de carta, hojas (Vaul), cabecera, barra
  screens/            Home, Spark, Craft, Break, TipDay, History, Onboarding
  styles/index.css    tokens de diseño, tipografías, animaciones
public/icons/         iconos PWA (generados desde la llama de Lumo)
```

## Stack

React + TypeScript, Vite, Tailwind CSS, Motion (gestos y animaciones), Vaul (hojas), Lucide (iconos), vite-plugin-pwa (offline e instalación), Vitest. Tipografías empaquetadas con Fontsource: Bricolage Grotesque, Instrument Serif, DM Sans, DM Mono.

## Notas

- Los iconos y el favicon son las gafas y el pico del patito sobre azul. El dorso de los mazos solo lleva el nombre. Para cambiarlos, sustituye los PNG de `public/icons/` y `public/favicon.png` manteniendo nombres y tamaños.
- No hay notificaciones: la web no puede programar un aviso diario sin servidor. `src/lib/notifications.ts` deja la interfaz preparada para una futura versión nativa.
