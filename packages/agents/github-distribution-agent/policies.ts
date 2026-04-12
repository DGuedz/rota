import { PolicyDecision, RotaEvent } from '@rota/shared-types';
import { githubDistributionAgentConfig } from './agent.config';

export const distributionPolicies = {
  validateAction(action: string): PolicyDecision {
    if (githubDistributionAgentConfig.forbiddenActions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação proibida para o Distribution Agent: ${action}`,
        requiresHumanApproval: false,
        action
      };
    }
    
    return {
      allowed: true,
      reason: 'Ação permitida pelas guardrails base.',
      requiresHumanApproval: action === 'update_changelog' || action === 'suggest_release_notes',
      action
    };
  },
  
  canPublishSkill(metadata: any): boolean {
    // Regra: Exige manifesto mínimo antes de publicar skill
    if (!metadata || !metadata.description || !metadata.commandExample) {
      return false;
    }
    return true;
  }
};
