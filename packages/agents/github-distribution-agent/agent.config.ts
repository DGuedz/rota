import { AgentConfig } from '@rota/shared-types';

export const githubDistributionAgentConfig: AgentConfig = {
  id: 'github-distribution-agent',
  name: 'GitHub Distribution Agent',
  mission: 'Transformar mudanças do repositório em ativos públicos de distribuição (release notes, docs, changelog).',
  autonomyLevel: 2, // Nível 2: Propõe
  allowedActions: [
    'write_docs',
    'update_changelog',
    'generate_public_metadata',
    'suggest_release_notes',
    'validate_readme'
  ],
  forbiddenActions: [
    'modify_smart_contracts',
    'alter_real_pricing',
    'modify_core_backend',
    'publish_without_manifest'
  ],
  ownedPaths: [
    '/docs',
    'CHANGELOG.md'
  ]
};
