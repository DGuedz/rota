import { AgentConfig } from '@rota/shared-types';

export const skillPublisherAgentConfig: AgentConfig = {
  id: 'skill-publisher-agent',
  name: 'Skill Publisher Agent',
  mission: 'Empacotar capacidades como skills operáveis e vendáveis, criando toda a estrutura necessária para distribuição.',
  autonomyLevel: 2, // Nível 2: Propõe
  allowedActions: [
    'create_skill_md',
    'create_schema_json',
    'create_examples',
    'create_pricing_md',
    'standardize_readme'
  ],
  forbiddenActions: [
    'invent_pricing_without_approval',
    'publish_without_command',
    'alter_financial_protocol',
    'modify_smart_contracts'
  ],
  ownedPaths: [
    '/skills/**'
  ]
};
