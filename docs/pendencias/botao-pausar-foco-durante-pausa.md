# Rótulo do botão principal durante uma pausa em execução

**Onde:** `packages/app/src/(timer)/timer.model.ts`, cálculo de `rotuloBotao`.

## Contexto

O CLAUDE.md define 4 rótulos para o botão principal do Temporizador: "Iniciar Foco", "Pausar Foco", "Continuar" e "Iniciar Pausa". Isso cobre a fase de foco (ocioso/rodando/pausado) e o início de uma pausa (ocioso), mas não diz o que mostrar quando o timer está **rodando durante uma pausa-curta ou pausa-longa** (único caso possível no Pomodoro Clássico, já que é o único preset com fase de pausa).

## Decisão tomada

Reusei o rótulo "Pausar Foco" também nesse caso, por não haver um 5º rótulo especificado:

```ts
const rotuloBotao =
  estado.status === 'pausado'
    ? TIMER_ROTULO_BOTAO.continuar
    : estado.status === 'rodando'
      ? TIMER_ROTULO_BOTAO.pausarFoco   // também usado durante a pausa rodando
      : estado.fase === 'foco'
        ? TIMER_ROTULO_BOTAO.iniciarFoco
        : TIMER_ROTULO_BOTAO.iniciarPausa
```

## Pergunta para o Igor

"Pausar Foco" soa estranho quando na verdade é a *pausa* que está rodando. Vale criar um 5º rótulo (ex.: apenas "Pausar") só para esse estado, ou "Pausar Foco" é aceitável mesmo fora da fase de foco?
