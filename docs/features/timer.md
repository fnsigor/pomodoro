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

### 7. Carrossel shadcn/Embla com seleção animada por Motion

- Dependências **`embla-carousel-react` (`^8.6.0`)** e **`motion` (`^14.9.0`)** adicionadas em `packages/ui`.
- `Carousel.tsx` é uma adaptação local do componente do shadcn/ui sobre o Embla (`Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, contexto e `useCarousel`). O tratamento de setas do teclado do shadcn foi **removido**: no FocusFlow, `←`/`→` são atalhos globais para trocar o preset.
- As setas do carrossel executam apenas `scrollPrev`/`scrollNext` do Embla. Elas **nunca** chamam `onSelecionar`: movem a lista sem trocar o preset selecionado. Ficam desabilitadas nas extremidades e somem abaixo de 621px, onde o arraste horizontal assume.
- A seleção continua acontecendo ao clicar no card (ou pelos atalhos de teclado) e usa a animação do Motion descrita abaixo.
- Se a seleção cair a menos de 24px de uma borda visível (por exemplo, um preset personalizado no fim da lista), `PresetSelector` rola até o item; clicar em um card já visível e com folga não move o carrossel. `watchSlides: true` mantém as medidas do Embla em dia quando o card selecionado muda de largura.
- A largura do carrossel é `620px`: no desktop ele mostra cinco dos seis itens (o "+ Novo" começa fora da área) para que as setas tenham o que mover. Em telas menores a quantidade visível diminui.
- O viewport do Embla usa `-mt-12 pt-12` para estender a área de recorte para cima: a margem negativa cancela o padding e o layout não se desloca, mas o card selecionado (que sobe `14px`) e o glow não são cortados. Nas laterais há um fade de 20px (`mask-image`), que suaviza o glow no limite do viewport.
- `PresetCard` virou `motion.button` com `layout` e spring (`stiffness: 460`, `damping: 36`, `mass: 0.7`): ao trocar a seleção, os cards vizinhos deslizam e o selecionado cresce/sobe de forma contínua. O conteúdo (valor, unidade e rótulo) entra com fade + scale de `0.18s`; há feedback de `whileTap` (`scale: 0.97`).
- `useReducedMotion` desliga as animações de layout, o fade e o `whileTap` quando `prefers-reduced-motion` está ativo.
- `packages/app/vitest.setup.ts` ganhou stubs de `ResizeObserver`, `IntersectionObserver` e `window.matchMedia`, usados pelo Embla/Motion e ausentes no jsdom.

Verificado com Playwright em 650×800 e 1440×900: clicar em "Próximas opções" altera a transformação do Embla e mantém o preset selecionado; `←`/`→` trocam a seleção; cliques em `Estendido`/`Deep Work` animam até ~320ms sem erros de console; o layout continua sem scroll de página.

### 8. Tamanho dos ícones e cursor dos botões

- `ControlButton` (reiniciar/pular) passou a dimensionar o SVG em **21px** (`[&_svg]:size-[21px]`), como no protótipo. Antes o SVG sem `width`/`height` herdava o tamanho intrínseco e ficava grande demais.
- `PrimaryButton` (iniciar/pausar e "Criar preset" no modal) dimensiona o SVG em **19px** (`[&_svg]:size-[19px]`). Isso corrige também o ícone de play gigante que quebrava o layout do modal de novo preset.
- Regra global em `styles.css` (`@layer base`): `button:enabled` e `[role="button"]:not([aria-disabled="true"])` usam `cursor: pointer`; `button:disabled` e `[role="button"][aria-disabled="true"]` usam `cursor: not-allowed`.
- As setas do carrossel trocaram `disabled:cursor-default` por `disabled:cursor-not-allowed` para seguir a mesma regra.

Verificado com Playwright: todos os botões habilitados retornam `cursor: pointer` e os desabilitados `cursor: not-allowed`; ícones medem 21px/19px; modal de preset sem quebra de layout e página continua sem scroll em 320–1440px.

### 9. Animação de entrada e saída dos modais

- `Modal` agora usa `AnimatePresence` + `motion.div` (Motion) e permanece montado durante a animação de saída; o `return null` anterior não permitia animar o fechamento.
- Fundo: fade de `0.18s` (`easeOut`). Card: spring (`stiffness: 420`, `damping: 34`, `mass: 0.8`) partindo de `opacity: 0`, `scale: 0.96` e `y: 8`, com a saída invertida.
- `useReducedMotion` zera as durações quando `prefers-reduced-motion` está ativo.
- Vale para os dois modais do app (selecionar atividade e criar preset); fechar por `Esc` ou clique no fundo continua funcionando.

Verificado com Playwright: aos 50ms o card está em `opacity ~0.67`, `scale ~0.987` e o fundo em `~0.71`; estabiliza em ~450ms; após fechar, o modal sai do DOM ao fim da animação. Com `reducedMotion: reduce`, abre e fecha instantaneamente. Sem erros de console.

### 10. Toasts com variantes (shadcn/Base UI)

- `Toast.tsx` foi reescrito com o **Toast do shadcn sobre o Base UI** (`@base-ui/react/toast`), com manager global (`toast.add`), provider, portal e viewport.
- `Toaster` é renderizado uma vez em `App.tsx`; `ShellPage` injeta `notificar(mensagem, tipo)` no shell, e o estado antigo de toast saiu do `useShellModel`.
- Posição: canto inferior direito (`fixed right-4 bottom-4`, largura máxima `sm`), com empilhamento, swipe para dispensar, timeout de 3s e limite de 3 toasts.
- Variantes, com fundo e ícone:
  - `success`: verde (`#166534`) + ícone de check;
  - `warning`: laranja (`#9a3412`) + ícone de alerta;
  - `error`: vermelho (`#991b1b`) + ícone de X;
  - `default`: `#242424` (cor padrão do app), sem ícone.
- Mapeamento atual das mensagens: sessão concluída, atividade alterada e preset criado → `success`; fase pulada → `warning`; temporizador reiniciado e pausa encerrada → `default`. A variante `error` está pronta para fluxos de erro; a validação do preset continua inline no modal.

Verificado com Playwright: preset criado mostra toast verde com ícone no canto inferior direito e some em ~3s; pular fase mostra laranja; reiniciar mostra o padrão; erro via manager mostra vermelho com ícone; empilhamento e offset funcionam; sem erros de console.

## Verificação

- `pnpm typecheck` — ok
- `pnpm lint` — ok
- `pnpm test` — 58 testes passando

## Pendências herdadas

- Meta diária configurável, notificações, perfil/avatar e streak dependem de decisão de produto (ver `CLAUDE.md`, seção "Em aberto").
- Reintroduzir Histórico e Atividades somente quando esses módulos entrarem no escopo.
