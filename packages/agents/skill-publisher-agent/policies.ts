import { PolicyDecision, RotaEvent } from '@rota/shared-types';
import { skillPublisherAgentConfig } from './agent.config';

export const publisherPolicies = {
  validateAction(action: string): PolicyDecision {
    if (skillPublisherAgentConfig.forbiddenActions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação proibida para o Skill Publisher Agent: ${action}`,
        requiresHumanApproval: false,
        action
      };
    }
    
    return {
      allowed: true,
      reason: 'Ação permitida pelas guardrails base.',
      requiresHumanApproval: action === 'create_pricing_md',
      action
    };
  },
  
  validateSkillPackage(skillData: any): boolean {
    // Validação estrita: Não pode publicar sem comando e contrato de I/O
    if (!skillData.command || !skillData.inputSchema || !skillData.outputSchema) {
      return false;
    }
    return true;
  }
};
