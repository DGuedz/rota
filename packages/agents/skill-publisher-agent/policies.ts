import { PolicyDecision } from '@rota/shared-types';
import { skillPublisherAgentConfig } from './agent.config';

export const publisherPolicies = {
  /**
   * Avalia se o Agente pode executar a ação requerida
   */
  validateAction(action: string): PolicyDecision {
    if (skillPublisherAgentConfig.forbiddenActions?.includes(action)) {
      return { allowed: false, reason: `Action ${action} is strictly forbidden for the publisher agent.`, requiresHumanApproval: false, action };
    }
    if (!skillPublisherAgentConfig.allowedActions.includes(action)) {
      return { allowed: false, reason: `Action ${action} is not an allowed capability.`, requiresHumanApproval: false, action };
    }
    
    // Nível de autonomia: a geração do pacote precisa ser validada no momento da PR ou manualmente
    const requiresApproval = action === 'generate_skill_package';

    return { allowed: true, requiresHumanApproval: requiresApproval, action, reason: "ok" };
  },

  /**
   * Política mínima para checar se a capability submetida tem cara de skill.
   */
  hasMinimumManifest(payload: any): boolean {
    if (!payload || typeof payload !== 'object') return false;
    
    const requiredKeys = ['id', 'description', 'pricing'];
    return requiredKeys.every(k => payload.hasOwnProperty(k));
  }
};
