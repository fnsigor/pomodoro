# Texto do toast ao final natural de uma pausa

**Onde:** `packages/app/src/(timer)/timer.messages.ts` (`TIMER_MENSAGENS.pausaEncerrada`) e `timer.model.ts` (`processarEfeitos`).

## Contexto

A máquina de estados do core (`packages/core/src/timer/maquina.ts`) emite o efeito `fimDeFase` sempre que uma fase termina — inclusive quando uma pausa-curta/pausa-longa chega ao fim naturalmente e o timer volta pra fase de foco. Esse é o único caso em que `fimDeFase` aparece **sem** um `registrarSessao` junto (pausa não é sessão). O CLAUDE.md lista "fase pulada" e "sessão concluída" como toasts, mas não define nenhum texto para "pausa terminou sozinha, hora de voltar a focar".

## Decisão tomada

Criei um texto próprio para esse caso:

```ts
pausaEncerrada: 'Pausa encerrada — hora de focar!',
```

Disparado em `timer.model.ts` quando chega um efeito `fimDeFase` sem `registrarSessao` junto, e a origem não foi um "pular" manual (que já tem seu próprio toast "Fase pulada").

## Pergunta para o Igor

Confirmar se esse texto bate com o tom desejado pro produto, ou se prefere outra redação.
