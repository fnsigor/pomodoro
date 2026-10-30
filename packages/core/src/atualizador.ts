export interface Atualizacao {
  versao: string
  notas: string
}

/**
 * Porta para checar/aplicar atualização do app. A implementação real fica nos
 * adaptadores: web é no-op (não existe update automático, só recarregar a
 * página), tauri usa `@tauri-apps/plugin-updater` + `@tauri-apps/plugin-process`.
 */
export interface Atualizador {
  verificar(): Promise<Atualizacao | null>
  instalar(): Promise<void>
}
