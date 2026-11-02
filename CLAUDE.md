# CLAUDE.md — FocusFlow

App de foco (temporizador estilo Pomodoro com atividades, histórico e meta diária). Um único codebase em Vite atende **browser** e **desktop (Tauri 2)**. Visual e regras de negócio são idênticos nas duas plataformas; a única diferença é a camada de persistência.

Idioma da UI: **pt-BR**. Idioma dos identificadores de domínio: português (`Sessao`, `Atividade`, `SessaoRepository`), como no documento de arquitetura. Termos técnicos genéricos ficam em inglês.

## Fontes de verdade

- `docs/arquitetura.md` — decisões de arquitetura (stack, dados, migrations, riscos).
- `design/*.html` — protótipo de referência do visual e do comportamento do timer: `home.html` (Temporizador) e `historico.html` (Histórico). **O visual é fonte de verdade e o app deve ser fiel a ele**; o código (JS, estrutura do HTML) não é para copiar: ver "Sobre o protótipo".

Se algo aqui conflitar com esses documentos, os documentos vencem; avise o Igor para atualizar este arquivo.

## Escopo

- Duas plataformas, ambas de primeira classe: web e desktop.
- **Fora do escopo:** mobile, PWA (sem service worker, sem manifest), sync entre dispositivos. Não adicione nada disso sem decisão explícita.
- Desktop usa a WebView do sistema. No macOS e no Linux ela é **WebKit, não Chromium**. Não dependa de API que só exista no Chrome sem testar lá antes.

## Estrutura do monorepo

```
apps/
  web/              Vite, build estático
  desktop/          Vite + src-tauri/
packages/
  core/             tipos, regras de negócio, interfaces de repositório
  ui/               componentes compartilhados + tema Tailwind
  adapters/
    web/            localStorage
    tauri/          SQLite via tauri-plugin-sql
  app/              páginas (padrão MVVM) compartilhadas por web e desktop
```

## Regras que não se quebram

1. **`packages/core` não importa nada de plataforma.** Nem `window`, nem `document`, nem `localStorage`, nem `@tauri-apps/*`. Uma violação só aparece quando a outra plataforma quebra no build, então isso deve ser verificado por lint (regra de import restrito). Se o lint ainda não existe, criar faz parte do trabalho.
2. **A fronteira de abstração é o repositório, não o storage.** Nunca exponha `query(sql)` nem chave de storage ao core. O core recebe o repositório por parâmetro (`criarXService(repo)`).
3. **Todo método de repositório é `async`**, mesmo no adaptador de `localStorage` (que é síncrono). Isso mantém a troca de adaptador possível.
4. **Consultas viram métodos nomeados do repositório.** Filtros e ordenações que o SQLite faria em SQL não são montados no core. Exemplo: "sessões do dia por atividade" é `listarDoDia(...)`, implementado em SQL no adaptador Tauri e em `filter` no adaptador web.
5. **IDs são gerados no cliente com UUID v7** (ordena por tempo). Nunca `AUTOINCREMENT`.
6. **Os dois adaptadores têm o mesmo contrato e o mesmo comportamento observável.** Mudou um, confira o outro.
7. **Migrations das duas plataformas vão no mesmo commit da mudança de schema.** É o maior custo escondido desta arquitetura; deixar uma para depois é como as plataformas divergem sem ninguém notar.

## Injeção do adaptador

Escolhida em **build time** por alias do Vite. O código compartilhado sempre escreve:

```ts
import { sessaoRepo } from '@app/adapters';
```

- `apps/web/vite.config.ts` → alias `@app/adapters` aponta para `packages/adapters/web`.
- `apps/desktop/vite.config.ts` → alias aponta para `packages/adapters/tauri`.

Não use `window.__TAURI__` para decidir adaptador em runtime: o adaptador não usado deve nem entrar no bundle.

## Páginas (`packages/app`) — padrão MVVM

Cada tela (Temporizador, Histórico, Atividades) segue **Page / Model / View**:

```tsx
// TimerPage.tsx — único lugar que escolhe a implementação concreta
import { sessaoRepo, atividadeRepo, presetRepo } from '@app/adapters'

export default function TimerPage() {
  const methods = useTimerModel({ sessaoRepo, atividadeRepo, presetRepo, relogio: relogioDoSistema, notificar })
  return <TimerView {...methods} />
}
```

- **Page** (`*Page.tsx`): único lugar que importa `@app/adapters` e escolhe a implementação concreta; chama o `use*Model` e repassa o retorno pra View.
- **Model** (`*.model.ts`): hook simples (`useState`/`useReducer`/`useEffect` — **sem TanStack Query**) com toda a lógica. Recebe repositórios/relógio por parâmetro, nunca importa `@app/adapters` diretamente, nunca toca DOM/CSS. Retorna objeto plano.
- **View** (`*.view.tsx`): `type Props = ReturnType<typeof use*Model>`; só compõe componentes de `@focusflow/ui` com classes Tailwind, nenhuma lógica.
- Navegação entre telas é **estado local no Shell**, sem router.
- Estrutura em `packages/app/src/`: `App.tsx`, `(shell)/` (abas, streak, toast compartilhado), `(timer)/`, `(historico)/`, `(atividades)/`, `infra/` (relógio do sistema, atalhos de teclado, título do documento).
- Consumido **como fonte** pelos dois apps (sem build próprio) — o alias `@app/adapters` do Vite de cada app resolve o adaptador certo mesmo dentro de `packages/app`.

## Adaptador web (localStorage)

- A coleção inteira vive em uma chave versionada (ex.: `sessoes:v1`); filtragem em JavaScript.
- **Toda escrita com `try/catch`** (cota de ~5 MB por origem, contada em UTF-16; tratar `QuotaExceededError`).
- Manter a coleção em memória e persistir com debounce se `JSON.stringify` começar a pesar na UI.
- Gravar em chave temporária e trocar, para não corromper se a aba fechar no meio da escrita.
- Aceitar que o Safari descarta storage após 7 dias sem interação: o web não é fonte de verdade. Se isso virar problema, a troca é para `idb-keyval` (um arquivo).
- Migrations: chave `schema_version` + **funções puras** que levam o JSON de uma versão para a seguinte. Cada salto de versão tem teste (rodam sem browser).

## Adaptador desktop (SQLite)

- SQL direto via `tauri-plugin-sql`, arquivo no disco do usuário (`sqlite:app.db`).
- Parâmetros sempre posicionais (`$1`, `$2`), nunca interpolação de string.
- Migrations usando as do próprio `tauri-plugin-sql` (`ALTER TABLE` versionado).
- **Todo plugin Tauri precisa ser liberado em `src-tauri/capabilities/`.** Sem isso a chamada falha em runtime, não no build. Manter um smoke test que exercita cada plugin usado.
- Rodar `tauri build` cedo e com frequência: base path e URLs absolutas quebram em `tauri://localhost`.
- Se CORS atrapalhar, trocar `fetch` por `tauri-plugin-http` (um arquivo, só no adaptador).

## Domínio e comportamento do timer

Derivado do protótipo. Estas regras pertencem ao `core` como lógica pura, sem DOM.

**Modos (presets)** — seletor horizontal; o padrão é Pomodoro Clássico. Rótulos exatamente como no protótipo:

| Preset | Duração | Na caixa | Observação |
| --- | --- | --- | --- |
| Livre | cronômetro crescente | `∞` (selecionado: unidade "LIVRE") | sem fim; o anel dá a volta a cada 60 min |
| Sprint curto | 15 min | `15` | |
| Pomodoro Clássico | 25 min | `25` | usa ciclo de 4 sessões com pausas |
| Estendido | 50 min | `50` | |
| Deep Work | 60 min | `1h` | |
| Personalizado | 1–240 min | valor | criado pelo botão "+ Novo"; vira preset do usuário (persistido no repositório) |

**Ciclo do Pomodoro:** foco → pausa; pausa curta de 5 min, exceto após a 4ª sessão (pausa longa de 15 min); depois da 4ª, volta para a sessão 1. Rótulo da fase acima do tempo: `FASE DE FOCO` / `PAUSA CURTA` / `PAUSA LONGA`.

**Ajuste de tempo:** regra anterior (−5 / +5 min, limites 5–120 min) **não aparece no protótipo atual**; o ajuste fino agora é feito criando preset personalizado. Não implementar os botões ±5 sem confirmação.

**Controles:** iniciar/pausar/continuar e reiniciar.

**Registro:** só entra no histórico sessão com pelo menos 1 minuto. Concluir um foco incrementa o total do dia e a contagem de ciclos.

**Meta diária:** 4 h por padrão (240 min). Card "Meta Diária" com valor `2h 15m de 4h`, barra limitada a 100% e legenda `N% concluído hoje • X ciclos`. Tornar a meta configurável é decisão de produto em aberto; hoje é constante.

**Atividades:** lista com nome e cor. Uma atividade ativa por vez (card "Atividade atual" à direita dos presets); cada sessão registrada guarda a atividade. A tela Atividades mostra o total acumulado por atividade. *(A tela Atividades ainda não tem protótipo; montar com os mesmos componentes do Histórico.)*

**Status da sessão:** o histórico distingue `CONCLUÍDO` (foco chegou ao fim) e `CANCELADO` (interrompida por reiniciar antes do fim, com ≥ 1 min). A sessão também guarda o preset usado (coluna "Tipo": "Preset Clássico", "Modo Livre"...). Isso é campo no schema: seguir o fluxo de mudança de schema.

**Histórico (tela):** filtros por período (`Dia` / `Semana` / `Mês` / `Ano`), por atividade e intervalo de datas; 4 cards de estatística (Tempo Total com variação vs período anterior, Ciclos Concluídos com média por dia, e foco por atividade com mini barra); gráfico de barras empilhadas por dia ("Distribuição de Tempo", eixo em horas); rosca "Por Atividade"; tabela "Sessões Recentes" (Data, Atividade, Duração, Tipo, Status). Todos os agregados são métodos nomeados do repositório (regra 4), não `filter`/`reduce` no core.

**Streak:** pílula com ícone de fogo e "N dias" no cabeçalho.

**Atalhos de teclado:** `Espaço` iniciar/pausar, `R` reiniciar, `←` `→` trocar modo. Ignorados quando o foco está em `input`/`textarea`; `Espaço` não dispara toggle se o foco estiver em um botão.

**Telas:** Temporizador, Histórico, Atividades (abas no cabeçalho). Título da aba/janela mostra o tempo restante enquanto roda (`MM:SS — FocusFlow`). Toast de confirmação nas ações (sessão concluída, reiniciado, atividade trocada).

### Sobre o protótipo

Arquivos: `design/home.html` (Temporizador, com abas, presets, anel, controles, meta diária e atalhos) e `design/historico.html` (Histórico: filtros, estatísticas, gráficos e tabela).

**O que portar (fidelidade visual):** cada bloco dos HTMLs vira componente em `packages/ui` e as telas em `apps/*` os compõem. O resultado precisa ser **visualmente fiel** ao protótipo: medidas, raios, espaçamentos, tamanhos de fonte, pesos, cores, ícones (SVGs inline do protótipo) e comportamento responsivo nos breakpoints. Ao terminar uma tela, comparar lado a lado com o HTML aberto no browser, nas três larguras (desktop, ≤ 1050px, ≤ 620px). Diferença visual só com decisão explícita.

Mapa de componentes sugerido (nomes podem mudar, a divisão não):

| Protótipo (classe) | Componente |
| --- | --- |
| `.topbar`, `.brand`, `.nav`, `.streak`, `.round-btn`, `.avatar` | `Topbar`, `Brand`, `NavTabs`, `StreakPill`, `IconButton`, `Avatar` |
| `.ready` | `StatusBadge` ("Pronto para começar") |
| `.presets`, `.preset`, `.arrow` | `PresetSelector`, `PresetCard` (normal / selecionado / adicionar) |
| `.activity` | `ActivitySelect` |
| `.timer-ring`, `.phase`, `.time`, `.mode-name` | `TimerRing`, `PhaseLabel`, `TimeDisplay` |
| `.controls`, `.control-btn`, `.start-btn` | `TimerControls`, `ControlButton`, `PrimaryButton` |
| `.panel` (meta) / `.shortcuts`, `.key` | `DailyGoalCard`, `ShortcutsCard`, `Kbd` |
| `.segmented`, `.filter-btn` | `SegmentedControl`, `FilterButton` |
| `.stat-card`, `.mini-track` | `StatCard`, `ProgressBar` (mesmo componente da meta) |
| `.chart-card`, `.bar-chart`, `.donut` | `Card`, `StackedBarChart`, `DonutChart` |
| `.sessions`, `table`, `.status` | `SessionsTable`, `StatusTag` |
| `.toast` | `Toast` |

**O que não copiar:** o código é vanilla JS com estado global mutável e dados fixos.

- Tirar a lógica do timer do DOM e modelá-la como máquina de estados pura em `core`, testável sem relógio real.
- O countdown do protótipo já calcula o restante por timestamp, mas o modo livre conta ticks de `setInterval` (deriva em segundo plano). No app, **tudo** por timestamp (início + duração / início + decorrido).
- O histórico do protótipo guarda texto ("Hoje, 14:30"). Persistir **timestamps** (ISO ou epoch) e formatar na UI.
- Remover os dados de exemplo: streak "4 dias", "2h 15m / 56% / 3 ciclos", dados do gráfico, sessões da tabela, números das estatísticas, faixa "Out 23 - Out 29", lista de atividades do `activitySelect`. Tudo deriva do repositório.
- O avatar aponta para imagem do Unsplash: não carregar imagem externa; usar placeholder local (iniciais) até existir perfil. O botão de notificações não tem comportamento definido: renderizar sem ação até haver decisão.
- `prompt()` para criar preset vira modal/popover próprio no design system (WebKit e Tauri tratam `prompt` de forma diferente).
- O seletor de atividade do protótipo só cicla a lista; no app é um menu (`listbox`).
- Faltam no protótipo `aria-*`, `role`s e `focus-visible`: adicionar conforme a seção de acessibilidade, sem alterar o visual.
- A fonte vem do Google Fonts por `<link>`. No app, **empacotar as fontes localmente** (desktop deve funcionar offline e o `tauri://` não deve depender de CDN).

## Design system

Visual **dark, flat**: fundo quase preto, cards em charcoal com borda fina de 1px, um único acento violeta, sem sombras de relevo (a exceção é o glow violeta do timer e do botão principal). Só existe **tema escuro**; não há botão de tema nem `prefers-color-scheme` a seguir (tema claro está em aberto). Todas as cores vêm de tokens CSS; **não use cor hardcoded em componente.**

Implementado com **Tailwind v4** (`@tailwindcss/vite`). Tokens e fontes ficam em `packages/ui/src/styles.css` (`@theme`, `@fontsource/*` locais, sem Google Fonts). `html`/`body` recebem `background`/`color` dos tokens `--color-bg`/`--color-ink` em `@layer base` — não dependa de um wrapper específico para isso.

**Armadilha já encontrada, não repetir:** `packages/ui` e `packages/app` ficam fora da raiz de cada app Vite (que é quem roda o Tailwind), então a varredura automática de classes **não os alcança por padrão**. `styles.css` precisa de `@source` explícito para os dois (`@source "./"` para o próprio `packages/ui`, `@source "../../app/src"` para `packages/app`). Sem isso, classes usadas só ali (ex.: `fill-none`, `stroke-track` dentro de um componente) somem silenciosamente do CSS final — o app roda e os testes passam, mas a tela sai sem estilo nenhum. Se criar um pacote novo com `className` próprio, adicione o `@source` dele também.

**Tipografia**

- **Space Grotesk** (400, 500, 600, 700) — display e números: marca "FocusFlow", tempo do timer (100px, peso 500, `letter-spacing: -5px`, `font-variant-numeric: tabular-nums`), números dos presets, títulos de página (25px/700), valores de estatística e meta (20–22px/700), teclas de atalho.
- **Inter** (400, 500, 600, 700) — todo o resto: navegação, rótulos, texto corrido, tabelas, botões.
- Fallback: `Arial, sans-serif`. Corpo 14px.
- Os dígitos do timer devem ter largura fixa (`tabular-nums`) para não "pular".

**Cores (tokens)**

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#0A0A0A` rgb(10,10,10) | Fundo principal (Deep Black) |
| `--panel` | `#1A1A1A` rgb(26,26,26) | Cards e painéis (Charcoal) |
| `--primary` | `#8B5CF6` rgb(139,92,246) | Violeta ativo: aba ativa, preset selecionado, anel, botão principal, barras |
| `--primary-soft` | `#A78BFA` rgb(167,139,250) | Violeta suave: teclas de atalho, segunda série nos gráficos |
| `--muted` | `#9CA3AF` rgb(156,163,175) | Texto secundário / desabilitado, ícones de controle |
| `--ink` | `#FFFFFF` | Texto principal |
| `--fire` | `#FB923C` rgb(251,146,60) | Ícone de fogo do streak |
| `--glow` | `rgba(139,92,246,.3)` | Glow do timer (primária a 30%) |

Neutros auxiliares que o protótipo usa (consolidar os cinzas quase idênticos no token mais próximo; a diferença é imperceptível e não justifica um token por hex):

| Token | Valor | Uso |
| --- | --- | --- |
| `--panel-2` | `#171717` | Superfícies rebaixadas (preset selecionado; `#151515`/`#191919`/`#1B1B1B` caem aqui ou em `--panel`) |
| `--panel-sunken` | `#0D0D0D` | Caixa de preset não selecionado |
| `--border` | `#282828` | Borda de cards, nav, botões (`#252525`–`#292929`) |
| `--track` | `#292929` | Trilho do anel/barras de progresso, linhas de grade (o anel usa `#1C1C1C`) |
| `--border-strong` | `#363636` | Borda de `Kbd` e toast |
| `--primary-hover` | `#9569F7` | Hover do botão principal |
| `--primary-tint` | `#282033` | Fundo dos ícones dos stat cards |
| `--success` | `#22C55E` (fundo `#1D3025`) | Status `CONCLUÍDO`, variação positiva |
| `--disabled-ink` | `#666666` / `#4B4B4B` | Rótulo e número de preset não selecionado |

Cores de atividade são dados do usuário, não tokens de tema. Nos gráficos do protótipo, a 1ª atividade usa `--primary` e a 2ª `--primary-soft` (na barra empilhada, `#655588`); com mais atividades, cada série usa a cor da própria atividade.

**Raios, bordas e efeitos**

- Bordas: sempre `1px solid` em tom de `--border`; preset selecionado com `2px solid --primary`; botão "+ Novo" com borda tracejada.
- Raios: nav e pílulas 28px/24px (totalmente arredondadas); cards inferiores e chart cards 22–24px; preset selecionado 24px, demais 15px; card de atividade e botão principal 17px; botões de controle 16px; segmented/filtros 12px; logo 13px; `Kbd` 4px. Botões redondos (notificação, avatar) 40px.
- Glow: anel do timer e o preset selecionado usam `--glow` / tons do primário com baixa opacidade; botão principal `box-shadow: 0 8px 18px rgba(139,92,246,.12)`; ponto "pronto" com halo `0 0 0 3px rgba(139,92,246,.1)`.

**Componentes e padrões**

- **Topbar:** grid de 3 colunas (marca | abas | ferramentas). Marca = ícone de raio em quadrado violeta 40px + "FocusFlow" em Space Grotesk 22/700 violeta. Abas em pílula escura com a ativa preenchida de `--primary`. À direita: streak, notificações, avatar com anel violeta.
- **Seletor de presets:** caixas 72px; a selecionada cresce para 112px, sobe, ganha borda violeta, número 30px + unidade ("MINUTOS"/"LIVRE") e rótulo violeta. Setas ← → nas pontas; "+ Novo" tracejado ao final.
- **Timer:** anel SVG de 368px, traço 8px, `stroke-linecap: round`, progresso em `--primary` sobre trilho escuro, começando no topo (rotação −90°). Dentro: rótulo da fase (14px, `letter-spacing: 3px`), tempo, nome do modo (18px, `--muted`).
- **Controles:** reiniciar em quadrado 56px; botão principal 68px de altura, mín. 226px de largura, ícone + rótulo ("Iniciar Foco" / "Pausar Foco" / "Continuar" / "Iniciar Pausa").
- **Cards inferiores:** grid 2 colunas (Meta Diária | Atalhos rápidos), 111px de altura.
- **Histórico:** 4 stat cards em grid (2 colunas ≤ 1000px), gráficos em `2fr 1fr` (1 coluna ≤ 1000px), tabela com rolagem horizontal (mín. 650px).
- **Toast:** central inferior, `#242424` com borda, raio 12px, `role="status"`.
- **Responsivo** (como no protótipo): Temporizador em 1050px (some "Pronto", card de atividade e ferramentas; cards inferiores em 1 coluna) e 620px (abas ocupam a largura toda, presets com rolagem horizontal sem setas, anel `min(82vw, 330px)`, tempo `clamp(65px, 19vw, 88px)`). Histórico em 1000px e 600px. Componentes de `ui` são compartilhados, mas **layouts não precisam ser**.

**Acessibilidade (parte do design, não opcional)**

- `:focus-visible` com contorno de 3px em `--primary`.
- Abas com `role="tablist"`/`tab` e `aria-selected`; presets como `radiogroup`; seletor de atividade como `listbox`/`option`; segmented de período como `radiogroup`; timer com `role="timer"` e `aria-label` com o tempo.
- Botões só de ícone sempre com `aria-label`.
- Gráficos com alternativa textual (tabela ou `aria-label` com os valores).
- Contraste: `--muted` sobre `--panel` passa AA para texto normal; `#666`/`#4B4B4B` (presets não selecionados) **não** passa: aceitável só por serem opções inativas com rótulo visível ao selecionar; não usar esses tons em texto informativo.
- Respeitar `prefers-reduced-motion` (desliga animações e transições).
- Respeitar `env(safe-area-inset-*)` e `viewport-fit=cover`.

## Convenções de trabalho

- **Não rode `pnpm lint`, `pnpm typecheck` nem `pnpm test` sem permissão.** Execute esses comandos (ou variações por pacote, como `pnpm --filter ... test`) somente quando o Igor pedir explicitamente. Se quiser validar uma mudança, descreva o que deveria ser rodado e aguarde a autorização.
- **Commits atômicos com prefixo.** Cada commit contém uma única mudança lógica e pode ser revertido sem arrastar trabalho não relacionado. Mensagens **sempre em inglês**, no imperativo, **sem emoji**, começando por um destes prefixos: `feat`, `fix`, `docs`, `style`, `test` ou `chore` (ex.: `fix: remove the idle timer badge`).
- TypeScript estrito. Sem `any` em `core` e nas portas.
- Testes: `core` (incluindo a máquina de estados do timer) e as funções puras de migration do web sempre têm teste; cada salto de versão tem um caso.
- Ao mudar o schema: tipo no `core` → método(s) no repositório → **os dois** adaptadores → **as duas** migrations → testes, tudo no mesmo commit.
- Ao adicionar API de browser nova: confirmar suporte em WebKit (macOS/Linux) antes de depender dela.
- Ao adicionar plugin Tauri: liberar em `capabilities/` e cobrir no smoke test.
- Não introduzir dependência de plataforma em `core` ou `ui` para "resolver rápido".
- **Datas: só `dayjs`.** Nada de `new Date()`, `Date.now()` ou `toLocaleString` fora de `packages/core/src/data.ts` — esse arquivo é o único que importa `dayjs` diretamente (configura locale `pt-br` e os plugins usados: `duration`, `isoWeek`, `isSameOrBefore`, `isBetween`, `calendar`); o resto do código importa `dayjs` reexportado de `@focusflow/core`. Persistência continua em epoch ms (número); conversão só nas bordas (`dayjs(n)` / `.valueOf()`).

## Comandos

```bash
pnpm dev:web         # apps/web em modo dev (Vite)
pnpm dev:desktop     # apps/desktop em modo dev (Vite + Tauri)
pnpm build:web       # build de produção do web
pnpm build:desktop   # build do desktop + `tauri build`
pnpm test            # vitest run em todo o workspace
pnpm test:watch
pnpm lint            # eslint na raiz inteira
pnpm typecheck       # typecheck recursivo (pnpm -r --if-present run typecheck)
```

## Decisões adiadas (não implemente antes do gatilho)

| Troca | Gatilho |
| --- | --- |
| `localStorage` → `idb-keyval` | bater na cota ou perder dados pelo ITP do Safari |
| `localStorage` → SQLite WASM em OPFS | precisar de paridade de SQL e migrations |
| `fetch` → `tauri-plugin-http` | CORS atrapalhar no desktop |
| Adicionar mobile | mudança de escopo → Capacitor sobre o build web |
| Sync entre dispositivos | dois usuários editando o mesmo registro (custo alto; decidir antes de o modelo de dados crescer, engines como PowerSync assumem SQLite dos dois lados) |

## Em aberto

- Volume esperado de dados por usuário? Acima de uns poucos MB, `localStorage` cai fora.
- O app web precisa funcionar offline, ou offline é só do desktop?
- Dados do web e do desktop são do mesmo usuário, e ele espera vê-los nos dois?
- Meta diária configurável, e de onde vem o valor padrão de 4 h?
- Tema claro: o protótipo novo é só escuro. Vai existir?
- Som de fim de fase (com liga/desliga) e ajuste ±5 min existiam no protótipo antigo e não aparecem no novo. Mantém, remove ou reposiciona?
- Cor de pausa: o protótipo antigo trocava o acento para verde na pausa; o novo não mostra o estado de pausa. Qual é o visual?
- Avatar e notificações aparecem no cabeçalho, mas não há perfil nem notificações no domínio.
- Tela Atividades não tem protótipo.