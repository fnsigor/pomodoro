# Ícones — placeholder

`icon.png` aqui é um PNG 1x1 transparente, só para o bundler ter um arquivo válido para ler. **Não é o ícone final.**

Antes de gerar um build de distribuição de verdade, rode:

```bash
pnpm --filter focusflow-desktop tauri icon caminho/para/icone-fonte-1024x1024.png
```

Isso gera o conjunto completo (`.ico` do Windows, `.icns` do macOS, PNGs de várias resolução) e atualiza `tauri.conf.json > bundle.icon` automaticamente.
