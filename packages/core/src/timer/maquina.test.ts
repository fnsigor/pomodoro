import { describe, expect, it } from 'vitest'
import { PRESETS_FIXOS } from '../presets'
import type { Preset } from '../dominio'
import { estadoInicial, transicionar } from './maquina'
import { decorridoMs, restanteMs } from './seletores'

const presetPorId = (id: string): Preset => {
  const p = PRESETS_FIXOS.find((p) => p.id === id)
  if (!p) throw new Error(`preset não encontrado: ${id}`)
  return p
}

const LIVRE = presetPorId('livre')
const SPRINT = presetPorId('sprint')
const POMODORO = presetPorId('pomodoro')

const MIN = 60_000
const T0 = Date.UTC(2026, 9, 29, 10, 0, 0)

describe('ciclo completo do Pomodoro', () => {
  it('4 focos + 3 pausas curtas + 1 pausa longa, volta pra sessão 1 em foco', () => {
    let estado = estadoInicial(POMODORO)
    let agora = T0

    const registros: Array<{ fase: string; duracaoSeg: number; status: string }> = []

    for (let sessao = 1; sessao <= 4; sessao++) {
      expect(estado.fase).toBe('foco')
      expect(estado.sessaoNoCiclo).toBe(sessao)

      // inicia o foco
      ;({ estado } = transicionar(estado, { tipo: 'alternar' }, agora))
      expect(estado.status).toBe('rodando')

      // salta os 25 min inteiros de uma vez (sem contar tick a tick)
      agora += 25 * MIN
      const r1 = transicionar(estado, { tipo: 'tick' }, agora)
      estado = r1.estado
      const efeitoFoco = r1.efeitos.find((e) => e.tipo === 'registrarSessao')
      expect(efeitoFoco).toBeDefined()
      if (efeitoFoco?.tipo === 'registrarSessao') {
        registros.push({ fase: 'foco', duracaoSeg: efeitoFoco.sessao.duracaoSeg, status: efeitoFoco.sessao.status })
        expect(efeitoFoco.sessao.duracaoSeg).toBe(25 * 60)
        expect(efeitoFoco.sessao.status).toBe('concluida')
      }

      const esperaPausa = sessao < 4 ? 'pausa-curta' : 'pausa-longa'
      expect(estado.fase).toBe(esperaPausa)
      expect(estado.status).toBe('ocioso')

      // inicia e conclui a pausa
      ;({ estado } = transicionar(estado, { tipo: 'alternar' }, agora))
      agora += (sessao < 4 ? 5 : 15) * MIN
      const r2 = transicionar(estado, { tipo: 'tick' }, agora)
      estado = r2.estado
      // pausa não gera sessão registrada
      expect(r2.efeitos.some((e) => e.tipo === 'registrarSessao')).toBe(false)
      expect(r2.efeitos.some((e) => e.tipo === 'fimDeFase')).toBe(true)
    }

    // voltou para o início do ciclo
    expect(estado.fase).toBe('foco')
    expect(estado.sessaoNoCiclo).toBe(1)
    expect(estado.status).toBe('ocioso')
    expect(registros).toHaveLength(4)
  })
})

describe('pular', () => {
  it('durante o foco gera sessão cancelada com a duração decorrida arredondada para baixo', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const agora = T0 + 90_500 // 1min30.5s
    const { estado: novoEstado, efeitos } = transicionar(estado, { tipo: 'pular' }, agora)

    const efeito = efeitos.find((e) => e.tipo === 'registrarSessao')
    expect(efeito).toBeDefined()
    if (efeito?.tipo === 'registrarSessao') {
      expect(efeito.sessao.status).toBe('cancelada')
      expect(efeito.sessao.duracaoSeg).toBe(90)
    }
    expect(novoEstado.status).toBe('ocioso')
    expect(novoEstado.fase).toBe('foco') // sprint não tem pausa
  })

  it('no modo Livre salva como concluída e zera o estado', () => {
    let estado = estadoInicial(LIVRE)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const agora = T0 + 70_000 // 70s
    const { estado: novoEstado, efeitos } = transicionar(estado, { tipo: 'pular' }, agora)

    const efeito = efeitos.find((e) => e.tipo === 'registrarSessao')
    expect(efeito).toBeDefined()
    if (efeito?.tipo === 'registrarSessao') {
      expect(efeito.sessao.status).toBe('concluida')
      expect(efeito.sessao.duracaoSeg).toBe(70)
    }
    expect(novoEstado).toEqual(estadoInicial(LIVRE))
  })

  it('durante a pausa avança pro próximo foco sem registrar sessão', () => {
    let estado = estadoInicial(POMODORO)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))
    const fimFoco = transicionar(estado, { tipo: 'tick' }, T0 + 25 * MIN)
    estado = fimFoco.estado
    expect(estado.fase).toBe('pausa-curta')

    const { estado: novoEstado, efeitos } = transicionar(estado, { tipo: 'pular' }, T0 + 25 * MIN + 1000)
    expect(efeitos.some((e) => e.tipo === 'registrarSessao')).toBe(false)
    expect(novoEstado.fase).toBe('foco')
    expect(novoEstado.sessaoNoCiclo).toBe(2)
  })
})

describe('sessão abaixo de 1 minuto', () => {
  it('não gera efeito de registrarSessao', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const { efeitos } = transicionar(estado, { tipo: 'pular' }, T0 + 30_000) // 30s
    expect(efeitos.some((e) => e.tipo === 'registrarSessao')).toBe(false)
  })
})

describe('restante/decorrido calculados por timestamp', () => {
  it('refletem pulos grandes de tempo sem precisar de tick a tick', () => {
    let estado = estadoInicial(SPRINT) // 15 min
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const agora = T0 + 10 * MIN
    expect(decorridoMs(estado, agora)).toBe(10 * MIN)
    expect(restanteMs(estado, agora)).toBe(5 * MIN)
  })

  it('soma corretamente o tempo acumulado entre pausas e retomadas', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0 + 3 * MIN)) // pausa aos 3min
    expect(estado.status).toBe('pausado')
    expect(estado.acumuladoMs).toBe(3 * MIN)

    const retomaEm = T0 + 20 * MIN // fica pausado por um bom tempo
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, retomaEm))
    expect(estado.status).toBe('rodando')

    const agora = retomaEm + 4 * MIN
    expect(decorridoMs(estado, agora)).toBe(7 * MIN) // 3min + 4min
  })
})

describe('trocarPreset', () => {
  it('é ignorado enquanto o timer está rodando', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const { estado: novoEstado, efeitos } = transicionar(estado, { tipo: 'trocarPreset', preset: POMODORO }, T0 + 1000)
    expect(novoEstado).toBe(estado)
    expect(efeitos).toEqual([])
  })

  it('é ignorado enquanto pausado', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0 + 1000))
    expect(estado.status).toBe('pausado')

    const { estado: novoEstado } = transicionar(estado, { tipo: 'trocarPreset', preset: POMODORO }, T0 + 2000)
    expect(novoEstado).toBe(estado)
  })

  it('troca o preset e reseta tudo quando ocioso', () => {
    const estado = estadoInicial(SPRINT)
    const { estado: novoEstado } = transicionar(estado, { tipo: 'trocarPreset', preset: POMODORO }, T0)
    expect(novoEstado).toEqual(estadoInicial(POMODORO))
  })
})

describe('reiniciar', () => {
  it('durante o foco com ≥ 1 min decorrido registra sessão cancelada e zera a fase', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const { estado: novoEstado, efeitos } = transicionar(estado, { tipo: 'reiniciar' }, T0 + 5 * MIN)

    const efeito = efeitos.find((e) => e.tipo === 'registrarSessao')
    expect(efeito).toBeDefined()
    if (efeito?.tipo === 'registrarSessao') {
      expect(efeito.sessao.status).toBe('cancelada')
      expect(efeito.sessao.duracaoSeg).toBe(5 * 60)
    }
    expect(novoEstado.status).toBe('ocioso')
    expect(novoEstado.acumuladoMs).toBe(0)
    expect(novoEstado.rodandoDesde).toBeNull()
    expect(novoEstado.inicioDaFase).toBeNull()
    expect(novoEstado.fase).toBe('foco')
  })

  it('com menos de 1 min decorrido não registra nada', () => {
    let estado = estadoInicial(SPRINT)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))

    const { efeitos } = transicionar(estado, { tipo: 'reiniciar' }, T0 + 30_000)
    expect(efeitos).toEqual([])
  })

  it('durante a pausa não registra sessão (pausa não é sessão)', () => {
    let estado = estadoInicial(POMODORO)
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0))
    ;({ estado } = transicionar(estado, { tipo: 'tick' }, T0 + 25 * MIN))
    expect(estado.fase).toBe('pausa-curta')
    ;({ estado } = transicionar(estado, { tipo: 'alternar' }, T0 + 25 * MIN))

    const { efeitos } = transicionar(estado, { tipo: 'reiniciar' }, T0 + 25 * MIN + 2 * MIN)
    expect(efeitos).toEqual([])
  })
})
