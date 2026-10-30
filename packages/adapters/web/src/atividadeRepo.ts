import type { AtividadeRepository, Id } from '@focusflow/core'
import { gravar, ler } from './armazenamento'

export const atividadeRepo: AtividadeRepository = {
  async listar() {
    return [...ler().atividades]
  },

  async obterAtiva() {
    const dados = ler()
    return dados.atividades.find((a) => a.id === dados.atividadeAtivaId) ?? null
  },

  async definirAtiva(id: Id) {
    const dados = ler()
    if (!dados.atividades.some((a) => a.id === id)) {
      throw new Error(`Atividade não encontrada: ${id}`)
    }
    gravar({ ...dados, atividadeAtivaId: id })
  },
}
