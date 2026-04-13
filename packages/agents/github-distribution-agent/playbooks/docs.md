# GitHub Distribution Agent - Docs Sync Playbook

## Triggers
- `repo.push_main`
- `repo.pr_merged`

## Objetivo
Garantir que a documentação técnica e a estrutura de READMEs estejam sempre consistentes com o código em produção.

## Etapas de Execução
1. Analisar as alterações submetidas para a `main`.
2. Identificar se as modificações envolvem:
   - Mudanças estruturais na API.
   - Atualizações em bibliotecas críticas.
   - Mudanças na integração com Soroban/Stellar.
3. Se aplicável, gerar sugestões ou aplicar as mudanças na documentação apropriada em `docs/`.
4. Validar o alinhamento da documentação com o 'ROTA — TRAE MASTER CONTEXT v1'.

## Restrições (Guardrails)
- O agente NUNCA deve alterar contratos inteligentes (`modify_smart_contracts` é estritamente proibido).
- O agente não modifica a lógica central do backend (`modify_core_backend`).
- Foco exclusivo em ativos de distribuição: `/docs` e `README.md`.
