# GitHub Distribution Agent - Release Playbook

## Triggers
- `repo.release_draft`

## Objetivo
Automatizar a criação de notas de lançamento (release drafts) públicas que comunicam valor técnico e econômico de forma clara e profissional.

## Etapas de Execução
1. Ler o histórico de PRs merged desde a última release.
2. Identificar mudanças críticas (ex: melhorias na liquidação on-chain, novas skills, melhorias de infraestrutura).
3. Gerar um resumo estruturado no formato ROTA:
   - **Protocol Updates:** Mudanças fundamentais de arquitetura.
   - **Skill Ecosystem:** Novas skills publicadas e modelos de monetização (x402).
   - **Fixes:** Resolução de bugs e otimizações de segurança.
4. Escrever o draft usando tom institucional, sem hype ou emojis.
5. Criar o Release Draft no GitHub aguardando aprovação humana (nível 2 de autonomia).

## Restrições (Guardrails)
- O agente NUNCA publica a release diretamente; apenas gera o draft (`requiresHumanApproval: true`).
- O agente não deve gerar relatórios longos sem propósito; focar na clareza.
