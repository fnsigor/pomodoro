import { chaveDoDia } from '@focusflow/core'
import type { IntervaloTempo, ResumoDoDia, Sessao, SessaoRepository } from '@focusflow/core'
import { gravar, ler } from './armazenamento'

export const sessaoRepo: SessaoRepository = {
  async salvar(s: Sessao) {
    const dados = ler()
    const sessoes = [...dados.sessoes]
    const idx = sessoes.findIndex((x) => x.id === s.id)
    if (idx === -1) sessoes.push(s)
    else sessoes[idx] = s
    gravar({ ...dados, sessoes })
  },

  async listarDoDia(i: IntervaloTempo) {
    const dados = ler()
    return dados.sessoes.filter((s) => s.inicio >= i.inicio && s.inicio <= i.fim)
  },

  async resumoDoDia(i: IntervaloTempo): Promise<ResumoDoDia> {
    // Reusa `listarDoDia` (já filtrada por intervalo) e filtra por `concluida`
    // em vez de reimplementar o filtro de data — mesma lógica de
    // `packages/core/src/testing/memoria.ts`.
    const doDia = await sessaoRepo.listarDoDia(i)
    const concluidasDoDia = doDia.filter((s) => s.status === 'concluida')
    return {
      totalSeg: concluidasDoDia.reduce((acc, s) => acc + s.duracaoSeg, 0),
      ciclos: concluidasDoDia.length,
    }
  },

  async listarDiasComFoco() {
    const dados = ler()
    const chaves = new Set<string>()
    for (const s of dados.sessoes) {
      if (s.status === 'concluida') chaves.add(chaveDoDia(s.inicio))
    }
    return [...chaves]
  },
}
