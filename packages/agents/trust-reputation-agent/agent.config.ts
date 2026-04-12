import { AgentConfig } from '@rota/shared-types';

export const trustReputationAgentConfig: AgentConfig = {
  id: 'trust-reputation-agent',
  name: 'Trust & Reputation Agent',
  mission: 'Manter a camada de confiança do protocolo ROTA, calculando scores, registrando strikes e gerindo o histórico de confiança off-chain.',
  autonomyLevel: 3, // Nível 3: Executa com guardrails
  allowedActions: [
    'recalculate_score',
    'register_strike',
    'emit_risk_alert',
    'update_trust_history'
  ],
  forbiddenActions: [
    'write_code',
    'modify_smart_contracts',
    'alter_pricing',
    'slash_onchain_funds_directly'
  ],
  ownedPaths: [
    // Opera sobre o banco de dados (tabela de reputação/agentes) offchain
  ]
};
