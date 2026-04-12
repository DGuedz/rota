import { AgentConfig } from '@rota/shared-types';

export const skillPublisherAgentConfig: AgentConfig = {
  id: 'skill-publisher-agent',
  name: 'Skill Publisher Agent',
  mission: 'Transformar capabilities internas e solicitações de publicação em pacotes de skills padronizados para o catálogo ROTA.',
  autonomyLevel: 2, // Propõe/Escreve artefatos em disco (nível 2 de autonomia local)
  allowedActions: [
    'validate_skill_candidate',
    'generate_skill_package',
    'scaffold_skill_structure'
  ],
  forbiddenActions: [
    'modify_core_backend',
    'alter_real_pricing_without_request',
    'publish_without_manifest',
    'modify_smart_contracts'
  ],
  ownedPaths: [
    'skills/',
    'skills/*/',
    'docs/skills/'
  ]
};
