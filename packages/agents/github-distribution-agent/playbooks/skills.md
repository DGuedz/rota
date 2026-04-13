# GitHub Distribution Agent - Skills Playbook

## Triggers
- `repo.skill_updated`

## Objetivo
Garantir que todas as skills adicionadas ao ecossistema ROTA sigam o padrão rígido de publicação (Distribution Doctrine).

## Etapas de Execução
1. Analisar as alterações submetidas para o pacote de skills (`skills/*/`).
2. Validar a presença e integridade dos seguintes arquivos e metadados mínimos:
   - `README.md`
   - `skill.md`
   - `schema.json`
   - `pricing.md`
   - `description` e `commandExample` no manifesto.
3. Se a skill possuir todos os requisitos:
   - Aprovar a validação (`SKILL_PUBLISH_APPROVED`).
4. Se faltar algum arquivo ou metadados essenciais:
   - Gerar `SKILL_README_FIX_SUGGESTION` com os requisitos faltantes.
   - Negar a aprovação da skill.

## Restrições (Guardrails)
- A aprovação de uma skill depende do `manifesto mínimo` e precificação real (`canPublishSkill`).
- O agente NUNCA pode alterar o preço real de uma skill (`alter_real_pricing`).
- O agente não publica skills sem o manifesto e documentação corretos (`publish_without_manifest`).
