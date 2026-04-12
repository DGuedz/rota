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
    
    if (!githubDistributionAgentConfig.allowedActions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação não listada nas permitidas do Distribution Agent: ${action}`,
        requiresHumanApproval: false,
        action
      };
    }
    
    return {
      allowed: true,
      reason: 'Ação permitida pelas guardrails base.',
      requiresHumanApproval: action === 'generate_release_draft' || action === 'update_docs_surface',
      action
    };
  },
  
  canPublishSkill(metadata: any): boolean {
    // Regra: Exige manifesto mínimo antes de publicar skill
    if (!metadata || !metadata.description || !metadata.commandExample || !metadata.pricing) {
      return false;
    }
    return true;
  }
};
