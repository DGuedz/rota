import { PolicyDecision, RotaEvent } from '@rota/shared-types';
import { trustReputationAgentConfig } from './agent.config';

export const reputationPolicies = {
  validateAction(action: string): PolicyDecision {
    if (trustReputationAgentConfig.forbiddenActions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação proibida para o Trust & Reputation Agent: ${action}`,
        requiresHumanApproval: false,
        action
      };
    }
    
    return {
      allowed: true,
      reason: 'Ação permitida pelas guardrails base.',
      requiresHumanApproval: action === 'slash_onchain_funds_directly', // Redundante, mas para reforçar a regra híbrida
      action
    };
  },

  validateScoreUpdate(agentId: string, eventId: string): boolean {
    // Reputação nunca é alterada sem evento correlacionado
    if (!agentId || !eventId) {
      return false;
    }
    return true;
  }
};
