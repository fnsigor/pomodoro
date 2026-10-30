import type { Preset, PresetRepository } from '@focusflow/core'
import { gravar, ler } from './armazenamento'

export const presetRepo: PresetRepository = {
  async listar() {
    // Só os personalizados — os fixos são `PRESETS_FIXOS` de `@focusflow/core`,
    // não ficam salvos aqui.
    return [...ler().presets]
  },

  async salvar(p: Preset) {
    const dados = ler()
    const presets = [...dados.presets]
    const idx = presets.findIndex((x) => x.id === p.id)
    if (idx === -1) presets.push(p)
    else presets[idx] = p
    gravar({ ...dados, presets })
  },
}
