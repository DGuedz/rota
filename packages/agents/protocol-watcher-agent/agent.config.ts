import { AgentConfig } from '@rota/shared-types';

export const protocolWatcherAgentConfig: AgentConfig = {
  id: 'protocol-watcher-agent',
  name: 'Protocol Watcher Agent',
  mission: 'Vigiar o ecossistema externo (Stellar, Soroban, x402, MPP, A2A/MCP) e alertar o protocolo sobre mudanças, riscos ou oportunidades.',
  autonomyLevel: 1, // Nível 1: Observa
  allowedActions: [
    'monitor_ecosystem',
    'summarize_changes',
    'open_internal_issue',
    'classify_impact'
  ],
  forbiddenActions: [
    'write_code',
    'modify_smart_contracts',
    'alter_pricing',
    'publish_content',
    'update_state_directly'
  ],
  ownedPaths: [
    '/docs/protocol/watcher-reports'
  ]
};
