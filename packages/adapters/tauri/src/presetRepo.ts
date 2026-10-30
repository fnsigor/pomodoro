import type { Preset, PresetRepository } from '@focusflow/core'
import { obterDb } from './db'

interface LinhaPreset {
  id: string
  nome: string
  minutos: number
}

export const presetRepo: PresetRepository = {
  async listar() {
    const db = await obterDb()
    const linhas = await db.select<LinhaPreset[]>('SELECT id, nome, minutos FROM presets ORDER BY nome')
    // A tabela `presets` só guarda personalizados (os fixos são `PRESETS_FIXOS`
    // do core) — `personalizado: true` é constante, não uma coluna.
    return linhas.map((l): Preset => ({ id: l.id, nome: l.nome, minutos: l.minutos, personalizado: true }))
  },

  async salvar(p: Preset) {
    const db = await obterDb()
    await db.execute(
      `INSERT INTO presets (id, nome, minutos) VALUES ($1, $2, $3)
       ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, minutos = excluded.minutos`,
      [p.id, p.nome, p.minutos],
    )
  },
}
