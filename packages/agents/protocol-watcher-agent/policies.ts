import { PolicyDecision, RotaEvent } from '@rota/shared-types';
import { protocolWatcherAgentConfig } from './agent.config';

export const watcherPolicies = {
  validateAction(action: string): PolicyDecision {
    if (protocolWatcherAgentConfig.forbiddenActions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação proibida para o Protocol Watcher Agent: ${action}`,
        requiresHumanApproval: false,
        action
      };
    }
    
    return {
      allowed: true,
      reason: 'Ação de observação e relatório permitida.',
      requiresHumanApproval: false, // Observação não requer aprovação, pois não altera estado real
      action
    };
  }
};
