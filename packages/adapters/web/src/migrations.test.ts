// Funções puras — roda sem browser (sem jsdom, sem localStorage).
//
// LEMBRETE (CLAUDE.md: "cada salto de versão tem teste"): quando existir uma
// v2, este arquivo ganha um bloco equivalente para `migrarV1ParaV2` (dado de
// v1 válido -> formato v2 esperado), além de continuar cobrindo que `migrar()`
// reconhece dados v1 velhos e os encaminha pela cadeia.
import { describe, expect, it } from 'vitest'
import type { DadosArmazenadosV1 } from './armazenamento'
import { migrar, seedPadrao, VERSAO_ATUAL } from './migrations'

const IDS_ATIVIDADES_SEED = ['estudo', 'trabalho', 'leitura', 'projeto-pessoal']

describe('seedPadrao', () => {
  it('devolve as 4 atividades padrão, sessões/presets vazios e "estudo" como ativa', () => {
    const seed = seedPadrao()
    expect(seed.versao).toBe(1)
    expect(seed.atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)
    expect(seed.sessoes).toEqual([])
    expect(seed.presets).toEqual([])
    expect(seed.atividadeAtivaId).toBe('estudo')
  })
})

describe('migrar', () => {
  it('migrar(undefined) devolve o seed com as 4 atividades', () => {
    const dados = migrar(undefined)
    expect(dados.atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)
    expect(dados.versao).toBe(VERSAO_ATUAL)
  })

  it('migrar(null) devolve o seed com as 4 atividades', () => {
    const dados = migrar(null)
    expect(dados.atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)
  })

  it('migrar de um JSON corrompido/tipo errado cai no seed, sem lançar exceção', () => {
    expect(() => migrar('{json quebrado')).not.toThrow()
    expect(migrar('{json quebrado').atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)

    expect(() => migrar({ lixo: true })).not.toThrow()
    expect(migrar({ lixo: true }).atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)

    expect(migrar(42).atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)
    expect(migrar([1, 2, 3]).atividades.map((a) => a.id)).toEqual(IDS_ATIVIDADES_SEED)
  })

  it('migrar(dadosArmazenadosV1 válido) devolve exatamente os mesmos dados, sem alterar', () => {
    const valido: DadosArmazenadosV1 = {
      versao: 1,
      atividades: [{ id: 'estudo', nome: 'Estudo', cor: '#8B5CF6' }],
      sessoes: [
        {
          id: 'sessao-1',
          atividadeId: 'estudo',
          presetId: 'pomodoro',
          inicio: 1000,
          fim: 2500,
          duracaoSeg: 1500,
          status: 'concluida',
        },
      ],
      presets: [{ id: 'preset-custom', nome: 'Meu preset', minutos: 33, personalizado: true }],
      atividadeAtivaId: 'estudo',
    }

    const resultado = migrar(valido)
    expect(resultado).toEqual(valido)
  })

  it('migrar(dadosArmazenadosV1 válido com atividadeAtivaId nulo) também passa direto', () => {
    const valido: DadosArmazenadosV1 = {
      versao: 1,
      atividades: [],
      sessoes: [],
      presets: [],
      atividadeAtivaId: null,
    }
    expect(migrar(valido)).toEqual(valido)
  })
})
