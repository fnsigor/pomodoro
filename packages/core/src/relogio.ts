import type { EpochMs } from './dominio'

/**
 * Porta para a hora atual. A implementação real (`dayjs().valueOf()`) fica fora
 * do core, em `packages/app` — aqui existe só a interface, para manter o core
 * testável com relógio simulado.
 */
export interface Relogio {
  agora(): EpochMs
}
