import { AgentConfig } from '@rota/shared-types';

export const githubDistributionAgentConfig: AgentConfig = {
  id: 'github-distribution-agent',
  name: 'GitHub Distribution Agent',
  mission: 'Transformar mudanças do repositório em ativos públicos de distribuição (release notes, docs, changelog).',
  autonomyLevel: 2, // Nível 2: Propõe
  allowedActions: [
    'read_repository_metadata',
    'generate_release_draft',
    'generate_changelog_entry',
    'validate_skill_package',
    'update_docs_surface',
    'generate_docs_sync_report'
  ],
  forbiddenActions: [
    'modify_smart_contracts',
    'alter_real_pricing',
    'modify_core_backend',
    'publish_without_manifest'
  ],
  ownedPaths: [
    'README.md',
    'CHANGELOG.md',
    'docs/',
    'skills/*/README.md',
    'skills/*/skill.md',
    'skills/*/pricing.md'
  ]
};
