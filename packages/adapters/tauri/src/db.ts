import Database from '@tauri-apps/plugin-sql'

let instancia: Database | null = null

/**
 * Conexão lazy/cacheada: `Database.load` abre (ou reusa, do lado Rust) o pool
 * de conexões do sqlx; cachear aqui evita reabrir a cada chamada de repositório.
 * As tabelas e o seed são criados pela migration registrada em `src-tauri/src/lib.rs`.
 */
export async function obterDb(): Promise<Database> {
  if (!instancia) instancia = await Database.load('sqlite:app.db')
  return instancia
}
