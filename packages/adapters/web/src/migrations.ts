// Funções PURAS de migration do adaptador web (CLAUDE.md: "chave `schema_version`
// + funções puras que levam o JSON de uma versão para a seguinte"). Nada aqui
// toca `localStorage` — quem lê/grava é `armazenamento.ts`. Isso é o que permite
// testar cada salto de versão sem browser (ver `migrations.test.ts`).
import type { Atividade, Id } from '@focusflow/core'
import type { DadosArmazenadosV1 } from './armazenamento'

export const VERSAO_ATUAL = 1

const ATIVIDADES_PADRAO: Atividade[] = [
  { id: 'estudo', nome: 'Estudo', cor: '#8B5CF6' },
  { id: 'trabalho', nome: 'Trabalho', cor: '#22C55E' },
  { id: 'leitura', nome: 'Leitura', cor: '#FB923C' },
  { id: 'projeto-pessoal', nome: 'Projeto pessoal', cor: '#38BDF8' },
]

const ATIVIDADE_ATIVA_PADRAO_ID: Id = 'estudo'

/** As 4 atividades padrão do protótipo (mesmos ids/nomes/cores usados pelo adaptador Tauri). */
export function seedPadrao(): DadosArmazenadosV1 {
  return {
    versao: 1,
    atividades: ATIVIDADES_PADRAO.map((a) => ({ ...a })),
    sessoes: [],
    presets: [],
    atividadeAtivaId: ATIVIDADE_ATIVA_PADRAO_ID,
  }
}

/**
 * v0 = "qualquer coisa que não seja um `DadosArmazenadosV1` reconhecível" (chave
 * vazia, corrompida, ou de uma versão anterior hipotética). Este app é
 * greenfield: não existe dado de v0 de verdade para aproveitar, então a
 * "migração" é simplesmente inicializar com `seedPadrao()`.
 *
 * Quando existir uma v2 de verdade, o padrão a seguir é análogo:
 *
 *   function migrarV1ParaV2(dados: DadosArmazenadosV1): DadosArmazenadosV2 {
 *     // transforma um DadosArmazenadosV1 de verdade (não `unknown`) no formato novo
 *   }
 *
 * e `migrar()` abaixo passa a encadear: reconhece a versão de `bruto` e aplica
 * `migrarV0ParaV1 -> migrarV1ParaV2 -> ...` até `VERSAO_ATUAL`.
 */
export function migrarV0ParaV1(bruto: unknown): DadosArmazenadosV1 {
  // `bruto` não é usado: v0 não tem nada aproveitável (ver comentário acima). O
  // parâmetro fica na assinatura só para ficar simétrico com uma futura
  // `migrarV1ParaV2(dados: DadosArmazenadosV1)`, que de fato usaria o seu.
  void bruto
  return seedPadrao()
}

function pareceDadosArmazenadosV1(bruto: unknown): bruto is DadosArmazenadosV1 {
  if (typeof bruto !== 'object' || bruto === null) return false
  const d = bruto as Record<string, unknown>
  return (
    d.versao === 1 &&
    Array.isArray(d.atividades) &&
    Array.isArray(d.sessoes) &&
    Array.isArray(d.presets) &&
    (typeof d.atividadeAtivaId === 'string' || d.atividadeAtivaId === null)
  )
}

/** Dispatcher: reconhece a versão de `bruto` e aplica a cadeia de migrations até `VERSAO_ATUAL`. */
export function migrar(bruto: unknown): DadosArmazenadosV1 {
  if (pareceDadosArmazenadosV1(bruto)) return bruto
  return migrarV0ParaV1(bruto)
}
