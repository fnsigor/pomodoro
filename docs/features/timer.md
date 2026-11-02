# Módulo Timer — decisões e estado atual

Documento de registro das decisões de produto/técnicas tomadas durante o desenvolvimento do módulo de timer. Fonte de verdade do comportamento continua sendo `docs/arquitetura.md` e `CLAUDE.md`; este arquivo registra o que foi decidido em cada sessão e o impacto no código.

## 2026-11-02 — Primeiro ajuste de escopo

Contexto: arquitetura pronta, início do desenvolvimento do módulo principal. Nesta fase existe **apenas o Temporizador**; Histórico e Atividades ainda não fazem parte do produto.

### 1. Navegação (paginação) oculta

- As abas `Temporizador | Histórico | Atividades` não são renderizadas. O shell mostra somente a tela do timer.
- Removido o estado de aba ativa do `useShellModel` e a renderização condicional das páginas de Histórico e Atividades.
- O `Topbar` passou a aceitar `navegacao` e `ferramentas` como props **opcionais**; sem elas, renderiza só a marca. O componente `NavTabs` continua em `@focusflow/ui` para quando as outras telas voltarem.
- Arquivos `(historico)/` e `(atividades)/` foram mantidos no repositório, porém inacessíveis. O tipo `AbaId` em `(shell)/shell.types.ts` também foi mantido para a retomada.

**Como reverter:** voltar a passar `navegacao={<NavTabs ... />}` ao `Topbar` e reintroduzir o estado de aba no shell.

### 2. Elementos da direita do topo removidos

Removidos do cabeçalho os três elementos que indicavam features fora do escopo atual:

- pílula de streak (ícone de fogo + dias na meta);
- ícone/botão de notificações;
- avatar do usuário.

Consequências:

- O shell não calcula mais streak (`calcularStreak` / `listarDiasComFoco` deixaram de ser chamados).
- O estado `streak` e a função `recarregarStreak` saíram do `useShellModel`.
- A prop `aoRegistrarSessao` saiu de `TimerPage` e de `useTimerModel`, pois só existia para avisar o shell a recalcular a streak ao salvar uma sessão. O registro de sessão continua intacto (persistência + resumo do dia).
- `StreakPill`, `IconButton`/`IconeSino` e `Avatar` continuam exportados por `@focusflow/ui` para uso futuro.

**Como reverter:** reintroduzir os componentes em `ferramentas` no `Topbar`, recalcular a streak no shell e religar `aoRegistrarSessao` ao salvar sessão.

### 3. Espaçamento dos cards de preset

Problema: no card selecionado do seletor de duração, o espaço entre o número (ex.: `25`) e a legenda `MINUTOS` estava visualmente grande.

Correção em `packages/ui/src/componentes/PresetCard.tsx`:

- `gap` interno do card selecionado: `5px` → `2px`;
- `leading-none` no número e na unidade, eliminando a folga de line-height herdada (o protótipo usa `line-height` normal no número de 30px).

**Correção definitiva (mesma data):** o ajuste acima não bastou porque o card usava `grid place-items-center` junto de `flex-col` — e `flex-col` não altera o `display`. O card continuava grid, com as duas linhas esticadas e cada uma centralizada na própria linha. O card selecionado agora usa `flex flex-col items-center justify-center`; a distância real entre número e unidade ficou em **2px** (medida no browser). As medidas atuais do card estão na seção 6.

### 4. Cards inferiores (meta diária e atalhos)

Os cards `DailyGoalCard` e `ShortcutsCard` estão ocultos na view do timer (mantidos comentados no código). O modelo ainda calcula o resumo do dia e os atalhos, então a reexibição é só descomentar o bloco na view.

### 5. Indicador "Pronto para começar" removido

A pílula de status ocioso (`.ready` no protótipo, `StatusBadge` no app) foi removida da tela do timer.

- Ela vinha de `estado.status === 'ocioso'` e não representava uma feature separada — só indicava que o timer estava parado no início da fase.
- O espaço da pílula na primeira coluna do grid de 3 colunas foi substituído por um espaçador vazio (`aria-hidden`), **oculto em ≤1050px**, para o seletor de presets continuar centralizado no desktop sem criar linha extra no tablet.
- `pronto` saiu de `useTimerModel` e o componente `StatusBadge` continua em `@focusflow/ui` para uso futuro.
- O teste da view deixou de verificar o indicador.

**Como reverter:** voltar a renderizar `<StatusBadge texto="Pronto para começar" />` no lugar do espaçador e reintroduzir `pronto` no model.

### 6. Layout em 100vh, sem scroll e ajustes de tamanho

- O shell agora usa `h-screen` e `overflow-x-hidden`; a tela do timer (`TimerView`) usa `flex min-h-0 flex-1` e a área do anel perdeu o `min-h-[430px]`, para caber exatamente no viewport sem barra de rolagem.
- **Anel e tempo acompanham a altura do viewport:** o anel usa `clamp(160px, calc(100vh - 388px), 368px)` no desktop e `min(82vw, 330px, 41vh)` abaixo de 621px. O `388` em `TimerRing.tsx` (`ALTURA_RESERVADA_PX`) é a soma de paddings, topbar, presets e controles (348) mais ~40px de folga para o anel não encostar na lista; **se o layout vertical mudar, esse valor precisa ser revisto**. O display do tempo passou de `100px` fixo para `clamp(65px, 13vh, 100px)`.
- **Scroll horizontal:** a causa era o `style={{ width, height }}` inline do `TimerRing`, que sobrescrevia a classe `max-mobile:` e mantinha o anel em 368px em telas menores (~370px de largura). A medida agora vai por CSS custom property (`--tamanho-anel`), permitindo o breakpoint funcionar. O root também ganhou `overflow-x-hidden`.
- **Card de preset selecionado menor:** caixa e largura `112px → 100px`, número `30px → 27px`, unidade `10px → 9px`, rótulo `14px → 13px`, recuo superior `-25px → -14px`, gap `14px → 12px`. No mobile: `86px → 78px`, número `25px → 23px`, rótulo `11px → 10px`, recuo `-18px → -10px`. Os cards não selecionados continuam em 72px.
- **Distância topbar → lista de presets:** `mt-12` (48px) → `mt-4` (16px). Com o recuo menor do card selecionado, a folga visual entre a logo e os cards não selecionados fica em ~23px, e a lista sobe o suficiente para aumentar a folga até o anel. O espaço entre o anel e os controles caiu de `35px` para `28px` (`mt-7`).

Verificado com Playwright em 1440×900, 1280×720, 1024×768, 800×600, 390×844 e 320×844: em todas as resoluções `scrollWidth`/`scrollHeight` iguais ao viewport (sem scroll horizontal ou vertical). Screenshots conferidos em 1440×900 e 320×844.

## Verificação

- `pnpm typecheck` — ok
- `pnpm lint` — ok
- `pnpm test` — 58 testes passando

## Pendências herdadas

- Meta diária configurável, notificações, perfil/avatar e streak dependem de decisão de produto (ver `CLAUDE.md`, seção "Em aberto").
- Reintroduzir Histórico e Atividades somente quando esses módulos entrarem no escopo.
