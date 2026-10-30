# Distribuição do desktop e atualizações automáticas

> Configuração inicial implementada (workflow de release, chave de assinatura, plugin updater, secrets do GitHub). Certificado de assinatura de código do instalador: decisão deliberada de ficar sem por enquanto — ver seção final.

## Como o usuário baixa o app

`tauri build` gera um instalador nativo por plataforma em `apps/desktop/src-tauri/target/release/bundle/`:

| Plataforma | Formato |
| --- | --- |
| Linux | `.deb`, `.rpm`, `.AppImage` (o AppImage roda em qualquer distro sem instalar nada) |
| Windows | `.msi` ou `.exe` (NSIS) |
| macOS | `.dmg` / `.app` |

O usuário final baixa o instalador do seu sistema operacional e instala como qualquer outro app.

### Build cross-plataforma via CI

Compilar para Windows exige uma máquina Windows e para macOS uma Mac — não dá para gerar os três a partir de um Linux. O caminho padrão é GitHub Actions com a action oficial `tauri-apps/tauri-action`, rodando em paralelo nos runners `ubuntu-latest`, `windows-latest` e `macos-latest`, publicando os três instaladores como anexos de uma GitHub Release a cada tag/push.

Esboço de workflow (`.github/workflows/release.yml`):

```yaml
name: release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'FocusFlow ${{ github.ref_name }}'
          args: --config apps/desktop/src-tauri/tauri.conf.json
```

As duas variáveis `TAURI_SIGNING_*` só existem depois do passo "gerar chave de assinatura" da seção de atualizações abaixo — são segredos do repositório (Settings → Secrets and variables → Actions), nunca commitados.

### Assinatura de código do instalador (aviso do SO, não da atualização)

Sem certificado de assinatura, o Windows (SmartScreen) e o macOS (Gatekeeper) avisam o usuário que o app é de "editor desconhecido" ou pedem para contornar a verificação. Para distribuir publicamente, eventualmente entra:

- **macOS:** Apple Developer Program (US$ 99/ano) + notarização.
- **Windows:** certificado de assinatura de código de uma CA.

Isso é independente da assinatura de atualização descrita abaixo (uma é o instalador, outra é o pacote de update) e não bloqueia nada hoje — só vai aparecer quando o app for distribuído para fora de um grupo fechado.

## Como enviar atualizações para quem já instalou

Mecanismo: plugin oficial `tauri-plugin-updater`. O app verifica um endpoint remoto, baixa e instala a nova versão, e reinicia.

### 1. Gerar o par de chaves de assinatura (uma vez só)

```bash
pnpm tauri signer generate -w ~/.tauri/focusflow.key
```

Gera uma chave privada (`~/.tauri/focusflow.key` — guardar em segredo, vira o secret `TAURI_SIGNING_PRIVATE_KEY` do CI) e uma pública (vai no `tauri.conf.json`, pode ser commitada).

### 2. Configurar `apps/desktop/src-tauri/tauri.conf.json`

```json
{
  "bundle": { "createUpdaterArtifacts": true },
  "plugins": {
    "updater": {
      "pubkey": "CONTEÚDO_DA_CHAVE_PÚBLICA_GERADA_ACIMA",
      "endpoints": [
        "https://github.com/<usuario>/pomodoro/releases/latest/download/latest.json"
      ]
    }
  }
}
```

O `latest.json` é publicado automaticamente pela `tauri-action` do workflow de release — nenhum passo manual extra.

### 3. Liberar a permissão em `apps/desktop/src-tauri/capabilities/default.json`

```json
{
  "permissions": ["core:default", "sql:default", "sql:allow-load", "sql:allow-execute", "sql:allow-select", "updater:default"]
}
```

### 4. Checar e aplicar a atualização no frontend

Precisa também de `@tauri-apps/plugin-process` (pra `relaunch`). Sugestão de onde entrar no código: `packages/app/src/(shell)/shell.model.ts`, checando uma vez ao abrir o app, e mostrando a pergunta pelo `Modal` que já existe em `packages/ui` (em vez de instalar silenciosamente):

```ts
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

const update = await check()
if (update) {
  // update.version / update.body (notas de release) -> mostrar no Modal
  // perguntando "Atualizar agora?" antes de instalar
  await update.downloadAndInstall()
  await relaunch()
}
```

Como `@app/adapters` resolve só pro adaptador web no app web, esse fluxo de update só existe no desktop (`apps/desktop`) — no web, "atualizar" é só o usuário recarregar a página.

## Pendências antes de implementar isto de verdade

- ✅ Workflow `.github/workflows/release.yml` criado.
- ✅ Chave de assinatura gerada localmente em `~/.tauri/focusflow.key` (privada, fora do repo) e `~/.tauri/focusflow.key.pub` (pública, já embutida em `tauri.conf.json`); a senha está em `~/.tauri/focusflow.key.password` (arquivo local, não commitado).
- ✅ Secrets `TAURI_SIGNING_PRIVATE_KEY` e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` cadastrados em Settings → Secrets and variables → Actions do repositório `fnsigor/pomodoro`.
- ✅ `@tauri-apps/plugin-updater` e `@tauri-apps/plugin-process` adicionados e registrados em `src-tauri/src/lib.rs`.
- ✅ UX escolhida: confirmação via `Modal` (recomendado pelo doc), implementada em `shell.model.ts`/`shell.view.tsx`.
- 🚫 **Decisão deliberada (2026-10-30): seguir sem certificado de assinatura de código por enquanto.** Instaladores do Windows e do macOS vão continuar disparando os avisos de "editor desconhecido"/Gatekeeper até essa decisão mudar — aceitável enquanto a distribuição for pra um grupo fechado. Revisitar quando o app for distribuído publicamente (ver "Assinatura de código do instalador" acima para o que envolve: Apple Developer Program US$ 99/ano + notarização, e certificado de code signing de uma CA pro Windows).
