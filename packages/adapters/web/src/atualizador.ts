import type { Atualizador } from '@focusflow/core'

// Web não tem mecanismo de update automático — "atualizar" ali é só recarregar
// a página. Implementação no-op pra satisfazer o contrato de `Atualizador`.
export const atualizador: Atualizador = {
  async verificar() {
    return null
  },
  async instalar() {},
}
