# Story Deck

Un mazo de cartas para desatascar la escritura. Web app instalable (PWA): sin cuenta, sin servidor, funciona sin conexión.

**App:** https://jessaran.github.io/story-deck/

- **Spark**: tres cartas (QUIÉN → GRIETA → FRICCIÓN) que forman una frase-semilla, más una Y SI… opcional.
- **Craft**: una carta de la categoría que elijas (Personaje, Conflicto, Mundo, Relación, Oficio).
- **Break**: una carta, ya.
- **Tip Day** (botón de la llama): una carta de oficio al día. Swipe izquierda descarta, derecha hace match. Un match por día.

Todo el contenido está en [`src/content.json`](src/content.json) (69 cartas de tirada + 40 tips). Todo el estado se guarda en el navegador (`localStorage`, clave `storydeck.v3`).

## Instalarla en el móvil

**iPhone (Safari):** abre el enlace → botón Compartir (cuadrado con flecha) → «Añadir a pantalla de inicio».

**Android (Chrome):** abre el enlace → menú ⋮ → «Instalar aplicación» (o «Añadir a pantalla de inicio»).

Tras la primera visita funciona sin conexión. Cuando se publica una versión nueva, la app muestra un aviso «Actualizar».

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
