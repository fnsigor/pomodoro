import { chaveDoDia } from '@focusflow/core'
import type { IntervaloTempo, ResumoDoDia, Sessao, SessaoRepository, StatusSessao } from '@focusflow/core'
import { obterDb } from './db'

interface LinhaSessao {
  id: string
  atividade_id: string
  preset_id: string
  inicio: number
  fim: number
  duracao_seg: number
  status: StatusSessao
}

function paraSessao(linha: LinhaSessao): Sessao {
  return {
    id: linha.id,
    atividadeId: linha.atividade_id,
    presetId: linha.preset_id,
    inicio: linha.inicio,
    fim: linha.fim,
    duracaoSeg: linha.duracao_seg,
    status: linha.status,
  }
}

export const sessaoRepo: SessaoRepository = {
  async salvar(s: Sessao) {
    const db = await obterDb()
    await db.execute(
      `INSERT INTO sessoes (id, atividade_id, preset_id, inicio, fim, duracao_seg, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT(id) DO UPDATE SET
         atividade_id = excluded.atividade_id,
         preset_id = excluded.preset_id,
         inicio = excluded.inicio,
         fim = excluded.fim,
         duracao_seg = excluded.duracao_seg,
         status = excluded.status`,
      [s.id, s.atividadeId, s.presetId, s.inicio, s.fim, s.duracaoSeg, s.status],
    )
  },

  async listarDoDia(i: IntervaloTempo) {
    const db = await obterDb()
    const linhas = await db.select<LinhaSessao[]>(
      'SELECT id, atividade_id, preset_id, inicio, fim, duracao_seg, status FROM sessoes WHERE inicio >= $1 AND inicio <= $2',
      [i.inicio, i.fim],
    )
    return linhas.map(paraSessao)
  },

  async resumoDoDia(i: IntervaloTempo): Promise<ResumoDoDia> {
    const db = await obterDb()
    const linhas = await db.select<Array<{ total: number; ciclos: number }>>(
      `SELECT COALESCE(SUM(duracao_seg), 0) as total, COUNT(*) as ciclos
       FROM sessoes WHERE status = 'concluida' AND inicio >= $1 AND inicio <= $2`,
      [i.inicio, i.fim],
    )
    const linha = linhas[0] ?? { total: 0, ciclos: 0 }
    return { totalSeg: linha.total, ciclos: linha.ciclos }
  },

  async listarDiasComFoco() {
    const db = await obterDb()
    // Não dá pra agrupar por "dia local" em SQL puro sobre epoch ms sem saber o
    // fuso do usuário: traz só os timestamps e calcula a chave do dia em TS com
    // `chaveDoDia` do core — mesma função usada pelo adaptador web.
    const linhas = await db.select<Array<{ inicio: number }>>(
      "SELECT inicio FROM sessoes WHERE status = 'concluida'",
    )
    const chaves = new Set<string>()
    for (const l of linhas) chaves.add(chaveDoDia(l.inicio))
    return [...chaves]
  },
}
