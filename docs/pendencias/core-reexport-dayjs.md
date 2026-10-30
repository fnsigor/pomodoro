# `@focusflow/core` passou a reexportar `dayjs`

**Onde:** `packages/core/src/index.ts`.

## Contexto

O CLAUDE.md e o plano original exigem que **todo** o resto do app importe `dayjs` só através de `@focusflow/core` (que é quem configura locale `pt-br` e os plugins), nunca direto — pra não configurar plugins/locale duas vezes. Só que `packages/core/src/index.ts` (marcado como "✅ completo" no handoff de implementação) não reexportava `dayjs`: a instância configurada só existia internamente em `packages/core/src/data.ts`, sem subpath nem export público.

Sem esse export, `packages/app/src/infra/relogioDoSistema.ts` não tinha como implementar `Relogio` respeitando a regra — e `@focusflow/app` nem declara `dayjs` como dependência direta no `package.json` (só `@focusflow/core`, `@focusflow/ui`, `react`, `react-dom`, `zod`), então importar `dayjs` direto ali também não seria correto nem resolveria como dependência do workspace.

## Decisão tomada

Adicionei uma linha em `packages/core/src/index.ts`:

```ts
export { dayjs } from './data'
```

É aditivo — não mudei nenhum comportamento, tipo ou teste existente do core. Todos os 35 testes do pacote continuam passando.

## Pergunta para o Igor

Só confirmar que está OK mexer nesse arquivo mesmo ele estando marcado como fechado no handoff. Entendo que era a única forma de fechar a lacuna sem violar a regra "dayjs só via core" ou inventar uma dependência direta não declarada.
