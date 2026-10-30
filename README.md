# FocusFlow

App de foco — temporizador estilo Pomodoro com atividades, histórico e meta diária. Um único codebase (Vite + React) atende **web** e **desktop** (Tauri 2); a regra de negócio e o visual são idênticos nas duas plataformas, só a persistência muda.

## Usar agora

- 🌐 **[Abrir o app web](https://focusflow-nine-iota.vercel.app)**
- 💻 **[Baixar o app desktop](https://focusflow-nine-iota.vercel.app/baixar.html)** — detecta seu sistema operacional e já mostra o instalador certo.

## Baixar o app desktop

Prefere ir direto na fonte? [Última versão (Releases)](https://github.com/fnsigor/pomodoro/releases/latest). A página de release tem bastante arquivo — a maioria não é pra baixar. Use esta tabela:

| Sistema | Baixe o arquivo que termina em |
| --- | --- |
| Windows | `_x64-setup.exe` (ou `.msi`, equivalente) |
| macOS | `.dmg` |
| Linux — a maioria das distros | `.AppImage` (não precisa instalar nada) |
| Linux — Debian/Ubuntu | `.deb` |
| Linux — Fedora/RHEL | `.rpm` |

Os arquivos `.sig` e o `latest.json` **não são pra baixar** — são usados internamente pelo app pra verificar atualizações. Depois de instalado, as próximas versões chegam automaticamente (o app mesmo avisa e pergunta antes de atualizar).

## Stack

- **React 19** + **TypeScript** estrito, **Tailwind v4** (tema escuro, tokens via `@theme`, sem CSS hardcoded).
- **Vite** como bundler/dev server das duas plataformas.
- **Tauri 2** pro desktop, com **SQLite** (`tauri-plugin-sql`) como persistência.
- **localStorage** como persistência do web.
- **dayjs** como única lib de datas (locale `pt-br`).
- **Vitest** + **Testing Library** para testes; **ESLint** com regras de fronteira entre camadas.
- **pnpm workspaces** para o monorepo.

## Estrutura

```
apps/
  web/              build estático (Vite)
  desktop/          Vite + src-tauri/ (Tauri 2)
packages/
  core/             domínio e regras de negócio puras (sem import de plataforma)
  ui/               componentes compartilhados + tema Tailwind
  adapters/
    web/            persistência via localStorage
    tauri/          persistência via SQLite
  app/              páginas (padrão MVVM: Page / Model / View), compartilhadas pelos dois apps
```

A escolha de adaptador (`localStorage` vs SQLite) acontece em **build time**, por alias do Vite — nunca em runtime. Detalhes completos de arquitetura, regras de domínio e design system estão em [`CLAUDE.md`](./CLAUDE.md), que é a fonte de verdade normativa do projeto.

## Rodando o projeto

Pré-requisitos: Node 22, pnpm, e — só para o desktop — Rust/Cargo e os pré-requisitos do [Tauri 2](https://v2.tauri.app/start/prerequisites/) pra sua plataforma.

```bash
pnpm install         # na raiz, uma vez

pnpm dev:web         # web em modo dev
pnpm dev:desktop     # desktop em modo dev (abre janela nativa via Tauri)

pnpm build:web       # build de produção do web
pnpm build:desktop   # build do desktop + instaladores nativos (tauri build)

pnpm test            # vitest run em todo o workspace
pnpm test:watch
pnpm lint            # eslint na raiz inteira
pnpm typecheck       # typecheck recursivo de todos os pacotes
```

## Protótipo visual

`design/home.html` (Temporizador) e `design/historico.html` (Histórico) são o protótipo de referência — o **visual é fonte de verdade**; o app precisa ser fiel a eles em medidas, cores, espaçamento e comportamento responsivo. O código desses HTMLs não é pra copiar, só o resultado visual (ver seção "Sobre o protótipo" do `CLAUDE.md`).

## Distribuição e atualizações (desktop)

O desktop já sai com instalador assinado (via `tauri-plugin-updater`) e workflow de release automatizado (`.github/workflows/release.yml`, dispara em tags `v*`). Detalhes de como funciona, o que já está configurado e o que ainda é decisão em aberto (certificado de assinatura de código do instalador) estão em [`docs/distribuicao-e-atualizacoes.md`](./docs/distribuicao-e-atualizacoes.md).

## Escopo

Web e desktop são as duas plataformas de primeira classe. **Fora do escopo** por enquanto: mobile, PWA e sync entre dispositivos — ver `CLAUDE.md` para o detalhe de cada decisão em aberto.
