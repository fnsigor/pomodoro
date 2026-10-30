// Testes de integração dos 3 repositórios contra o `localStorage` real do
// jsdom. `__resetCacheParaTeste()` (exportada só para teste, ver
// `armazenamento.ts`) zera o cache em memória do módulo entre os testes —
// sem isso, o jsdom reseta o `localStorage` entre arquivos de teste, mas o
// cache em memória do adaptador sobreviveria entre `test()`s do mesmo
// arquivo e mascararia bugs de persistência real.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Sessao } from '@focusflow/core'
import { atividadeRepo } from './atividadeRepo'
import { ArmazenamentoCheioError, __resetCacheParaTeste } from './armazenamento'
import { presetRepo } from './presetRepo'
import { sessaoRepo } from './sessaoRepo'

function criarSessao(overrides: Partial<Sessao> = {}): Sessao {
  return {
    id: 'sessao-1',
    atividadeId: 'estudo',
    presetId: 'pomodoro',
    inicio: new Date('2026-10-29T10:00:00').getTime(),
    fim: new Date('2026-10-29T10:25:00').getTime(),
    duracaoSeg: 25 * 60,
    status: 'concluida',
    ...overrides,
  }
}

function intervaloDoDia29(): { inicio: number; fim: number } {
  return {
    inicio: new Date('2026-10-29T00:00:00').getTime(),
    fim: new Date('2026-10-29T23:59:59').getTime(),
  }
}

beforeEach(() => {
  localStorage.clear()
  __resetCacheParaTeste()
})

describe('seed inicial', () => {
  it('localStorage limpo -> atividadeRepo.listar() já devolve as 4 atividades seed', async () => {
    const atividades = await atividadeRepo.listar()
    expect(atividades.map((a) => a.id)).toEqual(['estudo', 'trabalho', 'leitura', 'projeto-pessoal'])
  })

  it('obterAtiva() devolve "estudo" por padrão', async () => {
    const ativa = await atividadeRepo.obterAtiva()
    expect(ativa?.id).toBe('estudo')
  })
})

describe('persistência real (sobrevive a um "reload de página")', () => {
  it('sessão salva aparece ao reler com o cache em memória zerado', async () => {
    await sessaoRepo.salvar(criarSessao())

    // Simula reload de página: zera o cache em memória, forçando releitura do localStorage.
    __resetCacheParaTeste()

    const sessoes = await sessaoRepo.listarDoDia(intervaloDoDia29())
    expect(sessoes.map((s) => s.id)).toEqual(['sessao-1'])

    // Confirma que foi mesmo parar no localStorage, não só em memória.
    const bruto = localStorage.getItem('focusflow:dados')
    expect(bruto).not.toBeNull()
    const parsed = JSON.parse(bruto ?? '{}') as { sessoes: Sessao[] }
    expect(parsed.sessoes).toHaveLength(1)
    expect(parsed.sessoes[0]?.id).toBe('sessao-1')
  })

  it('salvar com o mesmo id substitui, não duplica', async () => {
    await sessaoRepo.salvar(criarSessao({ duracaoSeg: 100 }))
    await sessaoRepo.salvar(criarSessao({ duracaoSeg: 200 }))

    const sessoes = await sessaoRepo.listarDoDia(intervaloDoDia29())
    expect(sessoes).toHaveLength(1)
    expect(sessoes[0]?.duracaoSeg).toBe(200)
  })
})

describe('listarDoDia / resumoDoDia', () => {
  it('listarDoDia filtra só sessões dentro do intervalo', async () => {
    await sessaoRepo.salvar(criarSessao({ id: 's-dia', inicio: new Date('2026-10-29T10:00:00').getTime() }))
    await sessaoRepo.salvar(
      criarSessao({ id: 's-outro-dia', inicio: new Date('2026-10-28T10:00:00').getTime() }),
    )

    const doDia = await sessaoRepo.listarDoDia(intervaloDoDia29())
    expect(doDia.map((s) => s.id)).toEqual(['s-dia'])
  })

  it('resumoDoDia soma duração e conta só as sessões concluídas do intervalo', async () => {
    await sessaoRepo.salvar(criarSessao({ id: 's1', duracaoSeg: 600, status: 'concluida' }))
    await sessaoRepo.salvar(criarSessao({ id: 's2', duracaoSeg: 300, status: 'cancelada' }))
    await sessaoRepo.salvar(
      criarSessao({ id: 's3', inicio: new Date('2026-10-28T10:00:00').getTime(), duracaoSeg: 999 }),
    )

    const resumo = await sessaoRepo.resumoDoDia(intervaloDoDia29())
    expect(resumo).toEqual({ totalSeg: 600, ciclos: 1 })
  })
})

describe('listarDiasComFoco', () => {
  it('devolve as chaves únicas dos dias com ao menos uma sessão concluída', async () => {
    await sessaoRepo.salvar(
      criarSessao({ id: 's1', inicio: new Date('2026-10-29T10:00:00').getTime(), status: 'concluida' }),
    )
    await sessaoRepo.salvar(
      criarSessao({ id: 's2', inicio: new Date('2026-10-29T15:00:00').getTime(), status: 'concluida' }),
    )
    await sessaoRepo.salvar(
      criarSessao({ id: 's3', inicio: new Date('2026-10-28T10:00:00').getTime(), status: 'cancelada' }),
    )

    expect(await sessaoRepo.listarDiasComFoco()).toEqual(['2026-10-29'])
  })
})

describe('atividadeRepo.definirAtiva', () => {
  it('troca a atividade ativa e persiste', async () => {
    await atividadeRepo.definirAtiva('trabalho')
    __resetCacheParaTeste()

    expect((await atividadeRepo.obterAtiva())?.id).toBe('trabalho')
  })

  it('lança erro claro com id inexistente', async () => {
    await expect(atividadeRepo.definirAtiva('nao-existe')).rejects.toThrow(/nao-existe/)
  })
})

describe('presetRepo', () => {
  it('começa vazio (só guarda presets personalizados, os fixos vêm de PRESETS_FIXOS)', async () => {
    expect(await presetRepo.listar()).toEqual([])
  })

  it('salvar insere, e salvar de novo com o mesmo id substitui', async () => {
    await presetRepo.salvar({ id: 'p1', nome: 'Meu preset', minutos: 33, personalizado: true })
    expect(await presetRepo.listar()).toHaveLength(1)

    await presetRepo.salvar({ id: 'p1', nome: 'Meu preset atualizado', minutos: 40, personalizado: true })
    const presets = await presetRepo.listar()
    expect(presets).toHaveLength(1)
    expect(presets[0]?.nome).toBe('Meu preset atualizado')
  })
})

describe('quota excedida', () => {
  it('setItem lançando QuotaExceededError vira ArmazenamentoCheioError', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })

    try {
      await expect(sessaoRepo.salvar(criarSessao())).rejects.toThrow(ArmazenamentoCheioError)
    } finally {
      spy.mockRestore()
    }
  })
})
