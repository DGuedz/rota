import { routerAgentConfig } from './agent.config';
import { RotaEvent } from './triggers';

export const routerPolicies = {
  /**
   * Garante que o Router não execute ações que estão em sua lista proibida.
   */
  enforceGuardrails: (action: string) => {
    if (routerAgentConfig.forbiddenActions.includes(action)) {
      throw new Error(`Policy Violation: Action '${action}' is strictly forbidden for ${routerAgentConfig.name}`);
    }
  },
  
  /**
   * Certos eventos ou intenções mapeadas pelo Router requerem intervenção humana obrigatória.
   */
  requiresHumanApproval: (event: RotaEvent): boolean => {
    const humanInterventionEvents = [
      'policy.change',
      'contract.deploy',
      'pricing.update_base_tier'
    ];
    return humanInterventionEvents.includes(event.type);
  },

  maxExecutionScope: 'single_event_dispatch',
  
  errorHandling: {
    onUnknownEvent: 'log_and_discard',
    onAgentUnavailable: 'queue_for_retry',
    maxRetries: 3
  }
};
