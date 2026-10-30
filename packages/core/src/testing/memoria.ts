// Implementação de referência das 3 interfaces de repositório sobre arrays em
// memória, para uso em testes de outros pacotes (@focusflow/core/testing).
// Métodos continuam `async`/`Promise`, mesmo sendo síncronos por dentro — mesmo
// contrato dos adaptadores reais.
import type { Atividade, Id, Preset, Sessao } from '../dominio'
import type {
  AtividadeRepository,
  IntervaloTempo,
  PresetRepository,
  ResumoDoDia,
  SessaoRepository,
} from '../repositorios'
import { chaveDoDia } from '../tempo'

export interface SeedRepositoriosEmMemoria {
  atividades?: Atividade[]
  sessoes?: Sessao[]
}

export interface RepositoriosEmMemoria {
  sessaoRepo: SessaoRepository
  atividadeRepo: AtividadeRepository
  presetRepo: PresetRepository
  /** Array vivo (não uma cópia) — testes podem inspecionar o que foi salvo. */
  sessoes: Sessao[]
}

export function criarRepositoriosEmMemoria(seed?: SeedRepositoriosEmMemoria): RepositoriosEmMemoria {
  const atividades: Atividade[] = seed?.atividades ? [...seed.atividades] : []
  const sessoes: Sessao[] = seed?.sessoes ? [...seed.sessoes] : []
  const presets: Preset[] = []
  let atividadeAtivaId: Id | null = atividades[0]?.id ?? null

  const sessaoRepo: SessaoRepository = {
    async salvar(s: Sessao) {
      const idx = sessoes.findIndex((x) => x.id === s.id)
      if (idx === -1) sessoes.push(s)
      else sessoes[idx] = s
    },
    async listarDoDia(i: IntervaloTempo) {
      return sessoes.filter((s) => s.inicio >= i.inicio && s.inicio <= i.fim)
    },
    async resumoDoDia(i: IntervaloTempo): Promise<ResumoDoDia> {
      const concluidasDoDia = sessoes.filter(
        (s) => s.inicio >= i.inicio && s.inicio <= i.fim && s.status === 'concluida',
      )
      return {
        totalSeg: concluidasDoDia.reduce((acc, s) => acc + s.duracaoSeg, 0),
        ciclos: concluidasDoDia.length,
      }
    },
    async listarDiasComFoco() {
      const chaves = new Set<string>()
      for (const s of sessoes) {
        if (s.status === 'concluida') chaves.add(chaveDoDia(s.inicio))
      }
      return [...chaves]
    },
  }

  const atividadeRepo: AtividadeRepository = {
    async listar() {
      return [...atividades]
    },
    async obterAtiva() {
      return atividades.find((a) => a.id === atividadeAtivaId) ?? null
    },
    async definirAtiva(id: Id) {
      if (!atividades.some((a) => a.id === id)) {
        throw new Error(`Atividade não encontrada no seed: ${id}`)
      }
      atividadeAtivaId = id
    },
  }

  const presetRepo: PresetRepository = {
    async listar() {
      return [...presets]
    },
    async salvar(p: Preset) {
      const idx = presets.findIndex((x) => x.id === p.id)
      if (idx === -1) presets.push(p)
      else presets[idx] = p
    },
  }

  return { sessaoRepo, atividadeRepo, presetRepo, sessoes }
}
