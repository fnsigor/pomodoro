# Menu de atividades e modal de preset personalizado — sem fonte de verdade visual

**Onde:** `packages/app/src/(timer)/timer.view.tsx` (os dois `<Modal>` no fim do componente).

## Contexto

- `ActivitySelect` (`packages/ui`) é só o botão que mostra a atividade atual — o próprio componente tem um TODO explícito dizendo que o menu suspenso (`role="listbox"`/`"option"`) fica para quem o consumir.
- O CLAUDE.md pede que o `prompt()` nativo do protótipo (usado pra criar preset personalizado) vire um modal/popover próprio, já que WebKit e Tauri tratam `prompt()` de forma diferente.
- Nenhum dos dois tem desenho em `design/*.html` — o protótipo só usa `prompt()` e um seletor que cicla a lista.

## Decisão tomada

Implementei os dois usando o componente `Modal` já existente em `packages/ui`:

1. **Seletor de atividade**: lista em `role="listbox"` com botões `role="option"` (um por atividade), fecha e troca a atividade ativa ao clicar.
2. **Preset personalizado**: formulário com um `<input type="number">` (1–240, validado com zod em `timer.schema.ts`) e mensagem de erro inline, reproduzindo o texto do protótipo ("Informe um valor entre 1 e 240 minutos").

## Pergunta para o Igor

O visual desses dois modais foi montado só com os tokens do design system (sem referência de protótipo) — vale uma revisão visual dedicada quando houver tempo, já que não é uma tela com fonte de verdade em `design/*.html`.
