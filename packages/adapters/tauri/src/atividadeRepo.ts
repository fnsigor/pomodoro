import type { Atividade, AtividadeRepository, Id } from '@focusflow/core'
import { obterDb } from './db'

export const atividadeRepo: AtividadeRepository = {
  async listar() {
    const db = await obterDb()
    return db.select<Atividade[]>('SELECT id, nome, cor FROM atividades ORDER BY nome')
  },

  async obterAtiva() {
    const db = await obterDb()
    const linhas = await db.select<Atividade[]>('SELECT id, nome, cor FROM atividades WHERE ativa = 1 LIMIT 1')
    return linhas[0] ?? null
  },

  async definirAtiva(id: Id) {
    const db = await obterDb()
    const existentes = await db.select<Array<{ id: string }>>('SELECT id FROM atividades WHERE id = $1', [id])
    if (existentes.length === 0) {
      throw new Error(`Atividade não encontrada: ${id}`)
    }
    // `@tauri-apps/plugin-sql` v2 não expõe transação explícita na API JS
    // (só `select`/`execute`/`close`/`load`, confirmado via documentação oficial
    // do plugin) — as duas atualizações rodam sequencialmente, cada uma atômica
    // por conta própria via o pool do sqlx do lado Rust.
    await db.execute('UPDATE atividades SET ativa = 0')
    await db.execute('UPDATE atividades SET ativa = 1 WHERE id = $1', [id])
  },
}
