// Camada de persistência do adaptador web: uma única chave raiz no localStorage
// (`focusflow:dados`), cujo valor é um JSON versionado. Filtragem e regras de
// negócio NÃO moram aqui — isso é trabalho dos repositórios em `./sessaoRepo.ts`,
// `./atividadeRepo.ts` e `./presetRepo.ts`. Este arquivo só lê, migra e grava.
import type { Atividade, Id, Preset, Sessao } from '@focusflow/core'
import { migrar } from './migrations'

const CHAVE = 'focusflow:dados'
const CHAVE_TMP = 'focusflow:dados:tmp'

export interface DadosArmazenadosV1 {
  versao: 1
  atividades: Atividade[]
  sessoes: Sessao[]
  presets: Preset[]
  atividadeAtivaId: Id | null
}

/**
 * Erro próprio e reconhecível para cota de armazenamento estourada (CLAUDE.md:
 * "~5 MB por origem, contada em UTF-16; tratar QuotaExceededError"). A UI pode
 * capturar especificamente este tipo no futuro; por enquanto só propaga.
 */
export class ArmazenamentoCheioError extends Error {
  constructor(causa?: unknown) {
    super(
      'Armazenamento local cheio: não foi possível salvar os dados.',
      causa !== undefined ? { cause: causa } : undefined,
    )
    this.name = 'ArmazenamentoCheioError'
  }
}

// Mantém os dados em memória para não reler/reparsear o localStorage a cada
// chamada de repositório — só relê na primeira vez (ver `ler()`).
let cache: DadosArmazenadosV1 | null = null

function isQuotaExceededError(erro: unknown): boolean {
  // Não assume `instanceof DOMException`/`instanceof Error`: browsers variam na
  // cadeia de protótipo de DOMException. Basta checar o `name`, que é o que o
  // CLAUDE.md pede — cobre o nome moderno e o legado do Firefox antigo.
  if (typeof erro !== 'object' || erro === null) return false
  const nome = (erro as { name?: unknown }).name
  return nome === 'QuotaExceededError' || nome === 'NS_ERROR_DOM_QUOTA_REACHED'
}

export function ler(): DadosArmazenadosV1 {
  if (cache) return cache

  let bruto: unknown
  try {
    const texto = localStorage.getItem(CHAVE)
    bruto = texto === null ? undefined : JSON.parse(texto)
  } catch {
    // Chave corrompida (JSON inválido) ou localStorage inacessível: trata como v0.
    bruto = undefined
  }

  cache = migrar(bruto)
  return cache
}

export function gravar(dados: DadosArmazenadosV1): void {
  try {
    const texto = JSON.stringify(dados)
    // Grava em chave temporária e troca, para não corromper os dados se a aba
    // fechar no meio da escrita (CLAUDE.md, adaptador web).
    localStorage.setItem(CHAVE_TMP, texto)
    localStorage.setItem(CHAVE, texto)
    localStorage.removeItem(CHAVE_TMP)
    cache = dados
    // TODO: se `JSON.stringify` da coleção inteira começar a pesar na UI, o
    // próximo passo é debounce da escrita (CLAUDE.md) — fora de escopo do v1.
  } catch (erro) {
    if (isQuotaExceededError(erro)) {
      throw new ArmazenamentoCheioError(erro)
    }
    throw erro
  }
}

/** Só para teste: zera o cache em memória para simular um reload de página. */
export function __resetCacheParaTeste(): void {
  cache = null
}
