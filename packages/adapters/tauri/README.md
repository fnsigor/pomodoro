# `@focusflow/adapters-tauri`

Adaptador de persistência para o desktop (Tauri 2 + SQLite via `tauri-plugin-sql`). Mesmo contrato observável do `@focusflow/adapters-web` (regra 6 do `CLAUDE.md`): mesmas interfaces de `@focusflow/core`, mesmo seed de atividades, mesmas regras de agregação.

Schema e seed ficam na migration Rust (`apps/desktop/src-tauri/src/lib.rs`), não neste pacote — o TS só assume que as tabelas `atividades`, `sessoes` e `presets` já existem quando `obterDb()` é chamado.

## Por que não há teste automatizado aqui

`@tauri-apps/plugin-sql` fala com o banco via IPC real do Tauri (`Database.load`/`select`/`execute` chamam comandos Rust registrados em runtime). Não existe uma forma de mockar isso que teste algo de verdade sem subir o runtime do Tauri — um mock profundo só verificaria que o próprio mock funciona. Por isso a verificação é um **smoke test manual**, como o `CLAUDE.md` pede para todo plugin Tauri.

Este sandbox de implementação não tem `cargo`/Rust instalados, então o smoke test abaixo não pôde ser executado aqui — precisa rodar numa máquina com o ambiente Tauri completo antes de considerar esta parte validada de ponta a ponta.

## Checklist de smoke test manual

1. `pnpm install` na raiz (se ainda não rodou depois de clonar/pegar estas mudanças).
2. `pnpm dev:desktop` — o app deve abrir numa janela nativa sem erro de capability no console (erro de capability aparece em runtime, não no build — `CLAUDE.md`).
3. Conferir que as 4 atividades padrão aparecem (Estudo ativa, Trabalho, Leitura, Projeto pessoal) — vêm do `INSERT` de seed da migration v1.
4. Rodar uma sessão de foco até o fim (ou usar um preset curto) e confirmar que ela aparece registrada (resumo do dia atualiza).
5. Trocar a atividade ativa e confirmar que `obterAtiva()` reflete a troca (ex. reabrir a tela/trocar de aba).
6. Fechar o app completamente e reabrir (`pnpm dev:desktop` de novo, ou o binário buildado).
7. Confirmar que a sessão gravada no passo 4 e a atividade ativa do passo 5 **persistiram** — isto é o teste real de que o arquivo SQLite (`sqlite:app.db`, na pasta de config do app) está sendo escrito e lido corretamente entre execuções.
8. Opcional: inspecionar `app.db` com `sqlite3` para conferir as tabelas `atividades`, `sessoes`, `presets` e o índice `idx_sessoes_inicio`.
9. `pnpm build:desktop` (`tauri build`) — confirmar que o build de produção completa sem erro e que o smoke test acima também passa no binário final (não só em dev).

## Pontos que não puderam ser 100% confirmados sem `cargo`

Ver observações detalhadas no `src-tauri/` (comentários inline) e no resumo de implementação — a sintaxe Rust foi revisada manualmente contra a documentação oficial (`tauri-plugin-sql` v2 README, `tauri-docs` v2), mas nunca passou por `cargo check`/`cargo build` de verdade neste ambiente.
