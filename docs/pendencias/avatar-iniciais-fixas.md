# Avatar com iniciais fixas "FF"

**Onde:** `packages/app/src/(shell)/shell.view.tsx`.

## Contexto

O CLAUDE.md remove a imagem do Unsplash do protótipo e pede um placeholder local com iniciais "até existir perfil" — hoje não existe nenhum conceito de usuário/perfil no domínio (`packages/core`).

## Decisão tomada

Deixei fixo:

```tsx
<Avatar iniciais="FF" />
```

("FF" de FocusFlow, só pra não deixar vazio.)

## Pergunta para o Igor

Fica assim até existir perfil de usuário de verdade, ou já faz sentido ter um nome fixo (ex.: as iniciais do Igor) enquanto isso não existe?
