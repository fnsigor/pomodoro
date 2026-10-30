import type { Atividade, EpochMs, Id, Preset, Sessao } from './dominio'

export interface IntervaloTempo {
  inicio: EpochMs
  fim: EpochMs
}

export interface ResumoDoDia {
  totalSeg: number
  ciclos: number
}

export interface SessaoRepository {
  salvar(s: Sessao): Promise<void>
  listarDoDia(i: IntervaloTempo): Promise<Sessao[]>
  resumoDoDia(i: IntervaloTempo): Promise<ResumoDoDia>
  listarDiasComFoco(): Promise<string[]>
}

export interface AtividadeRepository {
  listar(): Promise<Atividade[]>
  obterAtiva(): Promise<Atividade | null>
  definirAtiva(id: Id): Promise<void>
}

export interface PresetRepository {
  /** Devolve só os presets personalizados — os fixos são `PRESETS_FIXOS`. */
  listar(): Promise<Preset[]>
  salvar(p: Preset): Promise<void>
}
