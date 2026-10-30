import { dayjs, type Relogio } from '@focusflow/core'

/** Implementação real de `Relogio` — único ponto do app que lê a hora do sistema. */
export const relogioDoSistema: Relogio = {
  agora: () => dayjs().valueOf(),
}
