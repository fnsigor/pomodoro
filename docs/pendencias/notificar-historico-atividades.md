# Histórico e Atividades ainda não recebem `notificar`

**Onde:** `packages/app/src/(shell)/shell.view.tsx`, `packages/app/src/(historico)/HistoricoPage.tsx`, `packages/app/src/(atividades)/AtividadesPage.tsx`.

## Contexto

O plano original (seção "Padrão MVVM por página") diz que o toast fica no Shell e é repassado para "a página ativa" — o que sugeriria passar `notificar` pras três páginas igualmente. Mas o handoff também define Histórico e Atividades como "esqueleto só, sem lógica ainda".

## Decisão tomada

Não passei `notificar` pra essas duas páginas por enquanto — `ShellView` renderiza `<HistoricoPage />` e `<AtividadesPage />` sem nenhuma prop. Isso evita um parâmetro declarado e não usado (o `tsconfig.base.json` do monorepo tem `noUnusedParameters: true`, que vira erro de `tsc`, não só de lint).

## Observação (não é bem uma decisão de produto, mais um lembrete técnico)

Quando a lógica real dessas telas for implementada e precisar mostrar toasts (ex.: ao editar uma atividade), será preciso:
1. Adicionar `notificar` como prop de `HistoricoPageProps`/`AtividadesPageProps`.
2. Repassar `notificar` (já disponível em `useShellModel`) nas chamadas de `<HistoricoPage />`/`<AtividadesPage />` em `shell.view.tsx`.

Nenhuma pergunta pendente aqui — só não esquecer quando chegar a vez dessas telas.
