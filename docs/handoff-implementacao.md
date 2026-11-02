# Handoff — implementação do FocusFlow

> Documento de retomada de trabalho, escrito para outro agente continuar a implementação já em andamento. Leia também `/home/igor/pomodoro/CLAUDE.md` (regras de arquitetura e domínio — é a fonte de verdade normativa) e `/home/igor/pomodoro/design/home.html` + `design/historico.html` (fonte de verdade visual) antes de escrever qualquer código.

## Ambiente

- Repo: `/home/igor/pomodoro`. Monorepo pnpm (`pnpm-workspace.yaml`: `apps/*`, `packages/*`, `packages/adapters/*`).
- Node 22, pnpm 10.33. **`pnpm install` já foi rodado na raiz** — `node_modules` e `pnpm-lock.yaml` existem. Rode `pnpm install` de novo só se adicionar/mudar uma dependência.
- **Este ambiente não tem `cargo`/Rust instalado.** Código Rust (parte Tauri) não pode ser compilado nem testado aqui — só escrito com cuidado e revisado manualmente. Se o ambiente de quem continuar tiver `cargo`, rode `cargo check` de verdade antes de dar por concluído.
- Não é um repositório git (`git status` falha com "not a git repository"). Não foi pedido para inicializar git — não inicialize por conta própria sem perguntar.

## Estado atual — o que já está pronto

Toda a configuração de raiz e os `package.json`/`tsconfig.json` de **todos** os pacotes/apps já existem (mesmo os que ainda não têm código — não recrie esses arquivos, só adicione `src/`):

```
package.json, pnpm-workspace.yaml, tsconfig.base.json, eslint.config.js,
vitest.workspace.ts, .gitignore                              → prontos

packages/core/           package.json, tsconfig.json          → prontos
packages/ui/             package.json, tsconfig.json          → prontos
packages/adapters/web/   package.json, tsconfig.json          → prontos
packages/adapters/tauri/ package.json, tsconfig.json          → prontos
packages/app/            package.json, tsconfig.json          → prontos
apps/web/                package.json                         → pronto (falta vite.config.ts, index.html, src/)
apps/desktop/            package.json                         → pronto (falta tudo mais, inclusive src-tauri/)
```

### ✅ `packages/core` — completo, testado, revisar decisões abaixo

35 testes passando, `tsc --noEmit` e `eslint` limpos. TS puro, sem nenhuma dependência de plataforma (lint de fronteira garante isso — ver "Regras de lint" abaixo).

Exports (`packages/core/src/index.ts`): `dominio.ts` (`Id`, `EpochMs`, `Fase`, `StatusSessao`, `Atividade`, `Preset`, `Sessao`), `presets.ts` (`PRESETS_FIXOS`, `PRESET_PADRAO_ID='pomodoro'`, `SESSOES_POR_CICLO=4`, `PAUSA_CURTA_MIN=5`, `PAUSA_LONGA_MIN=15`, `MINUTOS_PERSONALIZADO={min:1,max:240}`), `timer/maquina.ts` (`EstadoTimer`, `EventoTimer`, `EfeitoTimer`, `estadoInicial(preset)`, `transicionar(estado, evento, agora)`), `timer/seletores.ts` (`duracaoDaFaseMs`, `decorridoMs`, `restanteMs`, `progresso`, `rotuloFase`), `meta.ts` (`META_DIARIA_MIN=240`, `progressoDaMeta(totalSeg)`), `streak.ts` (`calcularStreak(diasComFoco, hoje)`), `tempo.ts` (`intervaloDoDia`, `chaveDoDia`, `formatarMMSS`, `formatarHorasMin`, `formatarDuracaoCurta`), `repositorios.ts` (interfaces `SessaoRepository`, `AtividadeRepository`, `PresetRepository`, `IntervaloTempo`, `ResumoDoDia`), `relogio.ts` (`Relogio`), `id.ts` (`novoId()`, UUID v7). Subpath separado `@focusflow/core/testing` → `criarRepositoriosEmMemoria(seed?)`.

**`EstadoTimer` real** (confira antes de usar em `packages/app`, os nomes de campo são estes, não os do rascunho original do plano):
```ts
interface EstadoTimer {
  preset: Preset
  fase: Fase                       // 'foco' | 'pausa-curta' | 'pausa-longa'
  sessaoNoCiclo: 1 | 2 | 3 | 4
  status: 'ocioso' | 'rodando' | 'pausado'
  rodandoDesde: EpochMs | null     // timestamp do último "iniciar/continuar"
  acumuladoMs: number              // decorrido acumulado antes do rodandoDesde atual
  inicioDaFase: EpochMs | null     // timestamp do 1º "iniciar" desta fase
}
type EventoTimer =
  | { tipo: 'alternar' } | { tipo: 'reiniciar' } | { tipo: 'tick' }
  | { tipo: 'trocarPreset'; preset: Preset }
type EfeitoTimer =
  | { tipo: 'registrarSessao'; sessao: Pick<Sessao,'presetId'|'inicio'|'fim'|'duracaoSeg'|'status'> }
  | { tipo: 'fimDeFase'; proxima: Fase }
```
`transicionar(estado, evento, agora) → { estado, efeitos }`. A UI despacha `tick` periodicamente (ex. a cada 250ms) só para a máquina checar se a fase terminou — o tempo mostrado na tela vem sempre de `restanteMs`/`progresso` recalculados a partir de timestamp, nunca de contar ticks.

**Decisões tomadas pelo agente do core, não 100% explícitas no CLAUDE.md (revisar com o Igor, mas já estão implementadas e testadas — não contradiga sem necessidade, ou vai precisar atualizar testes):**
1. Só o **Pomodoro Clássico** entra em fase de pausa. Os demais presets (Livre, Sprint, Estendido, Deep Work) ficam sempre em `fase: 'foco'` — terminar o foco deles reinicia um novo foco, sem pausa.
2. No fim natural da fase, `Sessao.fim`/`duracaoSeg` usam a **duração nominal** do preset (não o timestamp real do `tick`, que pode estar atrasado com a aba em background).
3. `fimDeFase` é emitido mesmo quando a fase não muda (presets sem pausa) — serve para a UI tocar o som de fim de fase.
4. Evento `tick` fora de `status: 'rodando'` é no-op.

### ✅ `packages/ui` — completo

`tsc --noEmit` e `eslint` limpos. 22 componentes em `packages/ui/src/componentes/` + `icones.tsx`, tudo reexportado por `index.ts`. **Não importa `@focusflow/core`** (props são primitivas/tipos locais) nem `@tauri-apps/*`/`@app/adapters` (lint de fronteira barra isso).

Tema Tailwind v4 em `packages/ui/src/styles.css` (`@theme` com os tokens de cor/fonte/breakpoints, fontes locais via `@fontsource`, `:focus-visible`, `prefers-reduced-motion`). **Ação pendente de limpeza**: há um comentário no topo do `@theme` dizendo que o CLAUDE.md "conflita" com o protótipo (sistema neumórfico vs. tema escuro) — isso está **desatualizado**, o CLAUDE.md já foi corrigido para o tema escuro antes dessa tarefa rodar. Remova esse comentário quando mexer no arquivo (não é urgente, só não propague a confusão).

Lista de componentes e props principais (todas em `packages/ui/src/componentes/*.tsx`, confira o arquivo antes de usar, as assinaturas abaixo são o essencial):

| Componente | Props principais |
| --- | --- |
| `Brand` | (sem props) — ícone + "FocusFlow" |
| `Topbar` | `{ marca, navegacao, ferramentas }` (slots nomeados, não `children`) |
| `NavTabs` | `{ abas: {id,rotulo}[], ativa, onSelecionar }` |
| `StreakPill` | `{ dias: number }` |
| `IconButton` | `{ icone, ariaLabel, title?, onClick, pressed? }` |
| `Avatar` | `{ iniciais: string }` (sem imagem externa, por decisão do CLAUDE.md) |
| `StatusBadge` | `{ texto: string }` |
| `PresetSelector` | `{ presets: {id,rotulo,valorCurto,unidade}[], selecionadoId, onSelecionar, onAnterior, onProximo, onNovoPreset }` |
| `PresetCard` | `{ rotulo, valorCurto, unidade?, variante: 'selecionado'\|'normal'\|'adicionar', ariaLabel?, onClick? }` |
| `ActivitySelect` | `{ rotulo, nome, corDot, onClick }` — **só o botão**; o menu dropdown (`listbox`) fica para quem consumir, junto com `Modal` (TODO explícito no componente) |
| `TimerRing` | `{ progresso: number (0-1), tamanho?=368, cor?, ariaLabel, children? }` — `role="timer"` |
| `PhaseLabel` | `{ texto: string }` |
| `TimeDisplay` | `{ texto: string }` |
| `ControlButton` | `{ icone, ariaLabel, title?, onClick }` |
| `PrimaryButton` | `{ icone, rotulo, onClick, disabled? }` |
| `Card` | `{ children, className? }` |
| `ProgressBar` | `{ percentual: number }` |
| `DailyGoalCard` | `{ valorPrincipal, valorMeta, legenda, percentual }` |
| `ShortcutsCard` | `{ atalhos: {tecla,descricao}[] }` |
| `Kbd` | `{ children }` |
| `Toast` | `{ mensagem: string \| null }` — `role="status"` |
| `Modal` | `{ aberto, titulo, onFechar, children }` — `role="dialog"`, fecha com Esc/clique fora |

Ícones em `packages/ui/src/icones.tsx`: `IconeRaio`, `IconeFogo`, `IconeSino`, `IconePlay`, `IconePause`, `IconeReiniciar`, `IconeSetaEsquerda`, `IconeSetaDireita`, `IconeChevron`.

### ✅ `packages/adapters/web` — completo, 18 testes passando

`packages/adapters/web/src/index.ts` exporta `sessaoRepo`, `atividadeRepo`, `presetRepo` (implementam as interfaces de `@focusflow/core`), mais `ArmazenamentoCheioError` e o tipo `DadosArmazenadosV1`. É este módulo que `apps/web/vite.config.ts` vai apontar via alias `@app/adapters`.

Decisões relevantes para quem for implementar `adapters/tauri` (**precisam bater, regra 6 do CLAUDE.md — mesmo contrato, mesmo comportamento observável**):
- Chave única no localStorage: `focusflow:dados` (guarda `{ versao, atividades, sessoes, presets, atividadeAtivaId }`) — **não** é `focusflow:v1:<colecao>` como o exemplo literal do CLAUDE.md sugeria; essa foi uma decisão de implementação (versão dentro do payload, não no nome da chave).
- **Seed de atividades padrão** (usar os MESMOS ids/nomes/cores no SQLite): 
  ```
  { id: 'estudo',          nome: 'Estudo',           cor: '#8B5CF6' }  ← ativa por padrão
  { id: 'trabalho',        nome: 'Trabalho',         cor: '#22C55E' }
  { id: 'leitura',         nome: 'Leitura',          cor: '#FB923C' }
  { id: 'projeto-pessoal', nome: 'Projeto pessoal',  cor: '#38BDF8' }
  ```
- `definirAtiva(id)` com id inexistente lança erro.
- `resumoDoDia`/`listarDoDia` filtram por `inicio >= intervalo.inicio && inicio <= intervalo.fim`; `resumoDoDia` soma `duracaoSeg` e conta só `status === 'concluida'`.
- `listarDiasComFoco()` devolve chaves `'YYYY-MM-DD'` (via `chaveDoDia` do core) únicas, só de sessões `concluida`.

### ❌ `packages/adapters/tauri` + `apps/desktop/src-tauri` — NÃO INICIADO (é a próxima tarefa)

Um agente começou essa tarefa e foi interrompido (`killed`) depois de ~49 min **ainda pesquisando a API** (`find-docs`/web) do `tauri-plugin-sql` v2, sem escrever nenhum arquivo. Confirmado antes de parar: o registro do plugin no Rust usa `Builder::new()` (builder de migrations). **Esta é a tarefa a retomar primeiro.**

Especificação completa (não foi perdida — reproduzida aqui para quem continuar não precisar repesquisar do zero o que já tinha sido decidido):

#### Parte 1 — `packages/adapters/tauri/src/` (TypeScript)

`package.json`/`tsconfig.json` já existem, com `@focusflow/core` e `@tauri-apps/plugin-sql@^2.2.0` já declarados como dependência.

Implementar as mesmas 3 interfaces (`SessaoRepository`, `AtividadeRepository`, `PresetRepository`) de `@focusflow/core`, exportando `sessaoRepo`/`atividadeRepo`/`presetRepo` em `index.ts` (é o módulo que `apps/desktop/vite.config.ts` vai apontar via alias `@app/adapters`).

`src/db.ts` — conexão lazy/cacheada:
```ts
import Database from '@tauri-apps/plugin-sql'
let instancia: Database | null = null
export async function obterDb(): Promise<Database> {
  if (!instancia) instancia = await Database.load('sqlite:app.db')
  return instancia
}
```
**Confirme via `find-docs`** (skill disponível) o nome exato da classe/import e do método de carregar antes de codificar — é exatamente o ponto em que o agente anterior parou.

Schema SQL (as migrations em si ficam registradas do lado Rust, parte 2 — o TS só assume que as tabelas já existem):
```sql
CREATE TABLE atividades (
  id TEXT PRIMARY KEY, nome TEXT NOT NULL, cor TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE sessoes (
  id TEXT PRIMARY KEY, atividade_id TEXT NOT NULL, preset_id TEXT NOT NULL,
  inicio INTEGER NOT NULL, fim INTEGER NOT NULL, duracao_seg INTEGER NOT NULL, status TEXT NOT NULL
);
CREATE TABLE presets (
  id TEXT PRIMARY KEY, nome TEXT NOT NULL, minutos INTEGER NOT NULL
);
CREATE INDEX idx_sessoes_inicio ON sessoes(inicio);
```
Seed (via `INSERT` na própria migration SQL, não no TS) — usar exatamente as 4 atividades da tabela acima, `ativa=1` só em `'estudo'`.

Repositórios — **sempre parâmetros posicionais** (`$1`, `$2`...), nunca interpolação de string:
- `sessaoRepo.salvar(s)`: `INSERT ... ON CONFLICT(id) DO UPDATE SET ...` (upsert por `id`); mapear `snake_case` ↔ `camelCase` (`atividade_id`→`atividadeId` etc.).
- `sessaoRepo.listarDoDia({inicio,fim})`: `SELECT * FROM sessoes WHERE inicio >= $1 AND inicio <= $2`.
- `sessaoRepo.resumoDoDia({inicio,fim})`: query agregada em SQL (não trazer tudo pra filtrar em JS): `SELECT COALESCE(SUM(duracao_seg),0) as total, COUNT(*) as ciclos FROM sessoes WHERE status='concluida' AND inicio>=$1 AND inicio<=$2`.
- `sessaoRepo.listarDiasComFoco()`: não dá pra agrupar por "dia local" em SQL puro sobre epoch ms sem saber o fuso — trazer só `SELECT inicio FROM sessoes WHERE status='concluida'` e calcular a chave do dia em TS com `chaveDoDia` do core, devolvendo únicas.
- `atividadeRepo.listar()`: `SELECT * FROM atividades ORDER BY nome`.
- `atividadeRepo.obterAtiva()`: `SELECT * FROM atividades WHERE ativa=1 LIMIT 1`.
- `atividadeRepo.definirAtiva(id)`: validar que o id existe (senão lançar erro, igual o adapter web); depois `UPDATE atividades SET ativa=0` seguido de `UPDATE atividades SET ativa=1 WHERE id=$1` (confirme via `find-docs` se o plugin expõe transação explícita — se expuser, usar; documentar no código se não).
- `presetRepo.listar()` / `salvar(p)`: igual ao padrão acima, upsert por `id`.

#### Parte 2 — `apps/desktop/src-tauri/` (Rust)

Diretório ainda não existe. Criar (e **não tocar** em `apps/desktop/index.html`/`vite.config.ts`/`src/main.tsx` — isso é escopo de quem for fazer `apps/desktop` depois, estágio seguinte):

- `Cargo.toml` — crate `focusflow-desktop`, edition 2021, deps `tauri = "2"`, `tauri-plugin-sql = { version = "2", features = ["sqlite"] }`, `serde`, `serde_json`. Confirmar versões exatas via `find-docs`/busca.
- `tauri.conf.json` — v2 mínimo: `productName: "FocusFlow"`, `identifier` (ex. `"br.com.focusflow.desktop"`), `build.frontendDist`/`devUrl`/`beforeDevCommand`/`beforeBuildCommand` coerentes com o Vite de `apps/desktop`, janela "FocusFlow".
- `capabilities/default.json` — `core:default` + as permissões exatas do plugin `sql` (load/execute/select) — **confirmar os identificadores atuais via `find-docs`, não adivinhar** (CLAUDE.md: "sem capability liberada a chamada falha em runtime, não no build").
- `src/lib.rs` — `pub fn run()` monta `tauri::Builder`, registra `tauri_plugin_sql` com uma migration `version: 1` contendo o SQL de criação das 3 tabelas + o `INSERT` de seed, roda o app.
- `src/main.rs` — entrypoint padrão Tauri 2 (confirmar o boilerplate atual via `find-docs`).
- `build.rs` — `fn main() { tauri_build::build() }`.
- `icons/` — placeholders (não desenhar ícone de verdade agora; comentar que `tauri icon` gera os de verdade depois).

**Sem `cargo` neste sandbox**: não dá pra compilar. Revisar sintaxe manualmente com cuidado redobrado. Documentar no final quais trechos não puderam ser confirmados 100% contra documentação oficial.

**Testes**: não dá pra testar `@tauri-apps/plugin-sql` de verdade sem runtime Tauri (IPC real) — não forçar mock profundo que não verifica nada real. Em vez de testes automatizados, criar `packages/adapters/tauri/README.md` com um checklist de smoke test manual (rodar `pnpm dev:desktop`, criar uma sessão, fechar/reabrir o app, confirmar persistência) — é o smoke test de plugin Tauri que o CLAUDE.md pede, só que só roda de verdade numa máquina com Tauri funcionando.

**Ao terminar, verificar o que dá pra verificar aqui:**
```
pnpm --filter @focusflow/adapters-tauri exec tsc --noEmit
pnpm eslint packages/adapters/tauri
```

### ❌ `packages/app` — NÃO INICIADO

Só tem `package.json`/`tsconfig.json`. É a camada que junta `core` + `ui` + o repositório escolhido em `@app/adapters`, no padrão MVVM. **Pode ser feito em paralelo com `adapters/tauri`** — só depende do contrato (`SessaoRepository` etc.) do core, que já existe, não da implementação Tauri estar pronta.

#### Padrão MVVM a seguir

Referência: `/home/igor/estudos/mvvm/src/(post)/` (`PostPage.tsx`, `post.model.ts`, `post.view.tsx`, `post.schema.ts`, `post.types.ts`, `post.messages.ts`) e `/home/igor/estudos/mvvm/ARCHITECTURE.md`. Camadas:
- **Page** (view-model): único lugar que escolhe a implementação concreta — aqui, importa `{ sessaoRepo, atividadeRepo, presetRepo }` de `@app/adapters` (em vez de instanciar `HttpClient`/`Service` como no projeto de referência — é a única diferença de padrão, documentada no plano original). Chama o hook `use*Model`, repassa o retorno pra `*View`.
- **Model** (`use*Model.ts`): hook com toda a lógica — recebe os repositórios/relógio via parâmetro (nunca importa `@app/adapters` diretamente), nunca toca DOM/CSS. Retorna objeto plano.
- **View** (`*.view.tsx`): componente burro, `type Props = ReturnType<typeof use*Model>`, só compõe componentes de `@focusflow/ui` com classes Tailwind.
- **Schema/Types/Messages**: zod (preset personalizado 1–240 min), tipos locais da tela, textos estáticos (toasts, rótulos).

**Decisão já tomada com o Igor**: models com **hooks simples** (`useState`/`useReducer`/`useEffect`), sem TanStack Query. Navegação entre abas por **estado local no Shell**, sem router.

#### Estrutura a criar em `packages/app/src/`

```
App.tsx                  monta <ShellPage/>
(shell)/ShellPage.tsx, shell.model.ts, shell.view.tsx, shell.types.ts
  - estado da aba ativa (timer/historico/atividades), streak (via atividadeRepo+sessaoRepo.listarDiasComFoco + calcularStreak),
    toast compartilhado (useState<string|null>, função `notificar` passada pras páginas filhas)
(timer)/TimerPage.tsx, timer.model.ts, timer.view.tsx, timer.schema.ts, timer.types.ts, timer.messages.ts,
        timer.model.test.ts, timer.view.test.tsx
(historico)/HistoricoPage.tsx, historico.model.ts, historico.view.tsx     ← esqueleto só, sem lógica ainda
(atividades)/AtividadesPage.tsx, atividades.model.ts, atividades.view.tsx ← esqueleto só
infra/relogioDoSistema.ts   { agora: () => dayjs().valueOf() } — implementa Relogio do core
infra/useAtalhosTeclado.ts  Espaço/R/S/←→, ignora quando foco em input/textarea, Espaço não dispara em cima de botão
infra/useTituloDocumento.ts document.title = `MM:SS — FocusFlow` enquanto roda
```

`packages/app/tsconfig.json` já tem `paths: { "@app/adapters": ["../adapters/web/src/index.ts"] }` para o typecheck isolado do pacote funcionar (os apps reais sobrescrevem isso via alias do Vite, cada um apontando pro seu adaptador). Se escrever `vitest.config.ts` para este pacote (necessário — `vitest.workspace.ts` da raiz já referencia `packages/app/vitest.config.ts`), configure o mesmo alias lá (`resolve.alias` ou `test.alias`) e `environment: 'jsdom'`, mais `setupFiles` com `@testing-library/jest-dom`.

#### `timer.model.ts` — comportamento esperado

`useReducer` (ou `useState` + função) sobre `transicionar` do core; `useEffect` com `setInterval` de ~250ms que só despacha `{ tipo: 'tick' }` com `agora = relogio.agora()` — nunca decrementa um contador por conta própria. Processa os `efeitos` devolvidos por `transicionar`: `registrarSessao` → monta um `Sessao` completo (`id: novoId()`, `atividadeId` da atividade ativa carregada) e chama `sessaoRepo.salvar`, depois recarrega o resumo do dia; `fimDeFase` → toca som (se ligado) e chama `notificar(mensagem)` via `timer.messages.ts`. Carrega atividades/presets personalizados/resumo do dia do repositório em `useEffect` inicial. Retorna objeto plano com pelo menos: tempo formatado (`formatarMMSS`), `progresso`, `fase`/rótulo, rótulo do botão principal (Iniciar Foco/Pausar Foco/Continuar/Iniciar Pausa — ver `timer.messages.ts`), lista de presets pro `PresetSelector` (fixos do core + personalizados do repo), atividade atual, dados pro `DailyGoalCard` (via `progressoDaMeta`), handlers (`alternar`, `reiniciar`, `selecionarPreset`, `criarPresetPersonalizado`, `trocarAtividade`), atalhos (pra `useAtalhosTeclado`), título (pra `useTituloDocumento`).

Teste `timer.model.test.ts`: `renderHook` com `criarRepositoriosEmMemoria()` de `@focusflow/core/testing` + relógio fake controlável — cenário mínimo: iniciar Pomodoro Clássico → avançar 25 min (sem passar por tick real, só mudando o `agora` do relógio fake e disparando os ticks do intervalo real do React, ou mockando `setInterval`) → sessão salva como `concluida`, resumo do dia atualizado, fase vira `pausa-curta`.

### ❌ `apps/web` e `apps/desktop` (vite.config.ts, index.html, src/main.tsx) — NÃO INICIADO

Depende de `packages/app` pronto. `apps/web/vite.config.ts` precisa do plugin `@tailwindcss/vite` + `@vitejs/plugin-react` + alias `'@app/adapters'` apontando pra `packages/adapters/web/src/index.ts`; `apps/desktop` igual, apontando pra `packages/adapters/tauri/src/index.ts`, mais `base: './'` (CLAUDE.md: URLs absolutas quebram em `tauri://localhost`). `src/main.tsx` de cada um importa `@focusflow/ui/styles.css` e renderiza `<App/>` de `@focusflow/app`.

## Regras de lint de fronteira (já configuradas em `/home/igor/pomodoro/eslint.config.js`, não desative)

- `packages/core/**`: proibido importar `@tauri-apps/*`, `react`, `react-dom`, `@app/adapters`, `@focusflow/ui`, `@focusflow/adapters-web`, `@focusflow/adapters-tauri`; proibido usar `window`/`document`/`localStorage`/`sessionStorage`/`navigator` como globais.
- `packages/ui/**`: proibido importar `@tauri-apps/*`, `@app/adapters`, `@focusflow/adapters-web`, `@focusflow/adapters-tauri`.
- Toda `className` com cor hardcoded (`#fff`, `rgba(...)`) em qualquer `.tsx` é erro de lint — usar token do Tailwind (`bg-primary`, não `bg-[#8B5CF6]`).

## Como validar cada pacote (comandos já confirmados funcionando)

```bash
pnpm --filter @focusflow/core test
pnpm --filter @focusflow/core typecheck
pnpm --filter @focusflow/ui exec tsc --noEmit
pnpm --filter @focusflow/adapters-web test
pnpm --filter @focusflow/adapters-web exec tsc --noEmit
pnpm --filter @focusflow/adapters-tauri exec tsc --noEmit   # só a parte TS
pnpm eslint packages/core packages/ui packages/adapters/web packages/adapters/tauri
pnpm test        # roda vitest.workspace.ts inteiro — hoje falha porque packages/app/vitest.config.ts não existe ainda
pnpm lint         # eslint na raiz inteira
```

## Ordem sugerida para continuar

1. **`packages/adapters/tauri` + `apps/desktop/src-tauri`** (especificação completa acima — retomar de onde parou).
2. **`packages/app`** (pode rodar em paralelo com o item 1 — só depende de `core`+`ui`, já prontos).
3. **`apps/web`** e **`apps/desktop`** (vite configs, `main.tsx`, `index.html`) — depende de `packages/app` pronto.
4. Atualizar `CLAUDE.md`: documentar o pacote `packages/app`, o padrão MVVM das páginas, Tailwind, dayjs como lib única de datas (já é regra em `packages/core/src/data.ts` — só falta documentar), seção "Comandos" (hoje diz "ainda não definidos", mas os scripts já existem no `package.json` raiz: `dev:web`, `dev:desktop`, `build:web`, `build:desktop`, `test`, `lint`, `typecheck`).
5. Verificação final: `pnpm test` + `pnpm lint` + `pnpm --filter focusflow-web build` na raiz; `pnpm dev:web` e comparar visualmente lado a lado com `design/home.html` em 1440px/1000px/390px; testar atalhos de teclado; `pnpm dev:desktop` + smoke test manual do SQLite (sem `cargo`/Tauri real disponível neste sandbox — só quem tiver o ambiente completo consegue rodar isso de ponta a ponta).
