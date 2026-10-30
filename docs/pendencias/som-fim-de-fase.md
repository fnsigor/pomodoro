# Som de fim de fase — não implementado

**Onde:** `packages/app/src/(timer)/timer.model.ts`, função `processarEfeitos`.

## Contexto

O CLAUDE.md lista explicitamente na seção "Em aberto":

> Som de fim de fase (com liga/desliga) e ajuste ±5 min existiam no protótipo antigo e não aparecem no novo. Mantém, remove ou reposiciona?

Ou seja, essa é uma decisão de produto que ainda não foi tomada — não há toggle de som em nenhuma tela, nem asset de áudio no repositório.

## Decisão tomada

Não implementei nenhuma reprodução de áudio. O efeito `fimDeFase` devolvido pela máquina do core só dispara o toast de notificação (ver `docs/pendencias/toast-pausa-encerrada.md` e a mensagem "Sessão concluída! Excelente trabalho."); não há `<audio>`, `AudioContext` nem qualquer chamada de API de som. Deixei um comentário no código apontando essa pendência:

```ts
// Som de fim de fase: decisão de produto em aberto no CLAUDE.md (liga/
// desliga ainda não existe na tela) — por enquanto só o toast abaixo.
```

## Pergunta para o Igor

Mantém, remove definitivamente ou reposiciona o som de fim de fase? Se mantiver: qual o asset de áudio e onde entra o controle de liga/desliga na tela (Atalhos rápidos? Topbar?).
