import type { Atualizacao, Atualizador } from '@focusflow/core'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, type Update } from '@tauri-apps/plugin-updater'

// Implementação real via `@tauri-apps/plugin-updater`: `verificar` guarda o
// objeto de update retornado por `check()` em closure, pra `instalar` poder
// chamar `.downloadAndInstall()` nele sem checar de novo, e então reiniciar
// com `@tauri-apps/plugin-process`.
export const atualizador: Atualizador = (() => {
  let atualizacaoPendente: Update | null = null

  return {
    async verificar(): Promise<Atualizacao | null> {
      const update = await check()
      atualizacaoPendente = update
      if (!update) return null
      return { versao: update.version, notas: update.body ?? '' }
    },

    async instalar(): Promise<void> {
      if (!atualizacaoPendente) return
      await atualizacaoPendente.downloadAndInstall()
      await relaunch()
    },
  }
})()
