import { BREAK_COLOR, PALETTE, TIP_COLOR } from './content'

export type ModeKey = 'spark' | 'craft' | 'break'

export const MODES = {
  spark: {
    title: 'Spark',
    color: PALETTE.spark,
    mech: '3 cartas de 3 mazos',
    sub: 'Empezar desde cero. Tres mazos, una tirada: la premisa nace del choque.',
    steps: [
      ['Empiezas desde cero', 'Spark es para cuando no tienes nada: ni personaje, ni trama, ni escena. Solo el hueco.'],
      ['Roba tres cartas', 'Desliza la carta superior del mazo hacia arriba, tres veces. QUIÉN, GRIETA y FRICCIÓN llenan sus huecos, boca abajo.'],
      ['Gíralas una a una', 'Toca cada carta y deja respirar la revelación. El orden en que las lees cambia lo que ves.'],
      ['Fuerza la combinación', 'La premisa nace de sostener las tres juntas, no de elegir la que más te guste.'],
      ['Si no engancha, tuerce', 'Añade una carta Y SI… para virar el tono o el género, o vuelve a tirar.'],
    ],
  },
  craft: {
    title: 'Craft',
    color: PALETTE.craft,
    mech: '1 carta dirigida',
    sub: 'Ya tienes algo y hay que trabajarlo. Elige qué elemento profundizar.',
    steps: [
      ['Ya tienes algo', 'Craft no inventa: trabaja lo que existe. Úsalo cuando la historia está en pie pero le falta fondo.'],
      ['Elige el elemento', 'Personaje, Conflicto, Mundo, Relación u Oficio: lo que quieres hacer más profundo.'],
      ['Roba del sub-mazo', 'No es azar puro: es una pregunta de profundización dirigida a ese elemento.'],
      ['Respóndela por escrito', 'Si la respuesta te cuesta, ahí está el trabajo. Roba otra solo cuando la hayas agotado.'],
      ['El sub-mazo Oficio', 'Once cartas destiladas de teoría dramática (Egri, McKee, Yorke, Truby, Snyder, Harmon, Aristóteles). Las más exigentes del mazo.'],
    ],
  },
  break: {
    title: 'Break',
    color: BREAK_COLOR,
    mech: '1 carta, ya',
    sub: 'Bloqueo puntual a mitad de escena. Una carta, ya.',
    steps: [
      ['Sin configurar nada', 'Arrastra la carta fuera del mazo hacia arriba: sale y se gira sola.'],
      ['Instrucción lateral', 'No te dice qué escribir: te dice qué romper en la escena en la que estás atascado.'],
      ['Aplícala y vuelve', 'Se usa a mitad de escena, en treinta segundos, y se cierra la app.'],
      ['Nada que configurar', 'Si dudas de qué modo usar y estás a mitad de párrafo, es este.'],
    ],
  },
} as const satisfies Record<ModeKey, { title: string; color: string; mech: string; sub: string; steps: readonly (readonly [string, string])[] }>

export const TIP_MODE = { title: 'Tip del día', color: TIP_COLOR, sub: 'Una carta de oficio al día. Un solo match.' }
