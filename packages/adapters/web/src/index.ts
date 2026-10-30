// Ponto de entrada do adaptador web — é para este módulo que o alias Vite
// `@app/adapters` aponta nos builds web (`apps/web/vite.config.ts`).
export { atividadeRepo } from './atividadeRepo'
export { presetRepo } from './presetRepo'
export { sessaoRepo } from './sessaoRepo'
export { atualizador } from './atualizador'

export { ArmazenamentoCheioError } from './armazenamento'
export type { DadosArmazenadosV1 } from './armazenamento'
