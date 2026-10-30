# Removido `"types": ["vite/client"]` de `packages/app/tsconfig.json`

**Onde:** `packages/app/tsconfig.json`.

## Contexto

O `tsconfig.json` de `packages/app` (já existente antes desta tarefa, não recriado) tinha:

```json
"types": ["vite/client"]
```

Mas `@focusflow/app` não declara `vite` como dependência (só `apps/web` e `apps/desktop` declaram, já que são eles que rodam o Vite de verdade) e o pacote não usa `import.meta.env` em lugar nenhum. Isso fazia `tsc --noEmit` falhar direto com:

```
error TS2688: Cannot find type definition file for 'vite/client'.
```

## Decisão tomada

Removi essa entrada do `types`. Parece ter sido copiada do tsconfig de um dos apps na hora de montar o scaffold do pacote, sem necessidade real aqui (pacotes internos são consumidos como fonte pelo Vite de cada app — ver CLAUDE.md, "Injeção do adaptador" — e não precisam dos tipos de cliente do Vite).

## Pergunta para o Igor

Se em algum momento `packages/app` passar a usar `import.meta.env` (ex.: para checar `DEV`/`PROD`), a correção certa na hora será **adicionar `vite` como devDependency** do pacote (pra `vite/client` resolver de verdade) em vez de reintroduzir essa linha sem a dependência.
