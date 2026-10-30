import type { Preset } from './dominio'

export const PRESETS_FIXOS: readonly Preset[] = [
  { id: 'livre', nome: 'Livre', minutos: null, personalizado: false },
  { id: 'sprint', nome: 'Sprint curto', minutos: 15, personalizado: false },
  { id: 'pomodoro', nome: 'Pomodoro Clássico', minutos: 25, personalizado: false },
  { id: 'estendido', nome: 'Estendido', minutos: 50, personalizado: false },
  { id: 'deep-work', nome: 'Deep Work', minutos: 60, personalizado: false },
]

export const PRESET_PADRAO_ID = 'pomodoro'

export const SESSOES_POR_CICLO = 4

export const PAUSA_CURTA_MIN = 5

export const PAUSA_LONGA_MIN = 15

export const MINUTOS_PERSONALIZADO = { min: 1, max: 240 } as const
