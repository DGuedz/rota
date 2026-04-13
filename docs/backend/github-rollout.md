# Rollout Checklist - GitHub Distribution Agent

Este documento descreve os passos seguros para desativar o modo `dryRun` e permitir que a ROTA publique releases e faça comentários reais no GitHub.

## Fase 1: Simulação Completa (Status:  Concluído)
- [x] Agente recebe eventos via EventBus (`github-distribution-agent`).
- [x] Agente roda policies sem crashar.
- [x] Adapters `GitHubReadService` e `GitHubWriteService` implementados.
- [x] Modo `dryRun=true` é o padrão de segurança.

## Fase 2: Read-Only na Nuvem
- [ ] Definir `GITHUB_TOKEN`, `GITHUB_REPO_OWNER` e `GITHUB_REPO_NAME` no `.env` do servidor (Railway/Fly/etc).
- [ ] Manter `ROTA_GITHUB_DRY_RUN="true"`.
- [ ] Enviar PR e verificar se o `AgentExecutionLog` no Postgres capta a leitura de commits (`update_docs_surface`).

## Fase 3: Primeira Ação de Escrita Parcial (Comentário em PR) (Status:  Concluído / Pronto)
- [x] O código foi ajustado com a flag `liveComments` via `ROTA_GITHUB_LIVE_COMMENTS`.
- [x] Criado script de teste para validar o bypass de segurança (`scripts/test-live-comment.ts`).
- [ ] O operador (você) deve rodar o script apontando um PR válido.
- [ ] Validar se o bot comentou na PR e o guardrail de draft release continua ativo.

## Fase 4: Autonomia de Release Draft (Full Nível 2)
- [ ] Ativar `ROTA_GITHUB_DRY_RUN="false"` no `.env` de produção.
- [ ] O Agente ganha permissão para rodar `createReleaseDraft`.
- [ ] Quando a PR for merged na `main`, o bot deve criar uma Release no GitHub, mas a Release **deve ficar como DRAFT** (exigido por código).
- [ ] Um humano (Administrador) revisa a release draft gerada e clica em "Publish" manualmente na interface do GitHub.

---

**Nota de Segurança:** NUNCA modifique o `draft: true` no método `createReleaseDraft` do `GitHubWriteService`. Isso garante que o agente nunca crie tags públicas irrevogáveis.
