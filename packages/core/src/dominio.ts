export type Id = string

export type EpochMs = number

export type Fase = 'foco' | 'pausa-curta' | 'pausa-longa'

export type StatusSessao = 'concluida' | 'cancelada'

export interface Atividade {
  id: Id
  nome: string
  cor: string
}

export interface Preset {
  id: Id
  nome: string
  /** `null` representa o modo Livre (cronômetro sem fim). */
  minutos: number | null
  personalizado: boolean
}

export interface Sessao {
  id: Id
  atividadeId: Id
  presetId: Id
  inicio: EpochMs
  fim: EpochMs
  duracaoSeg: number
  status: StatusSessao
}
