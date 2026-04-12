import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { reputationPolicies } from './policies';
import { trustReputationAgentConfig } from './agent.config';

const logger = new StructuredLogger(trustReputationAgentConfig.id);

export async function runReputationAgent(event: RotaEvent): Promise<ExecutionResult> {
  logger.info(event.eventId, 'receive_event', `Iniciando processamento de evento de reputação: ${event.type}`);
  
  try {
    const requiredAction = getRequiredAction(event);
    if (!requiredAction) {
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: 'Evento não mapeado para impacto em reputação.'
      };
    }

    const policyDecision = reputationPolicies.validateAction('recalculate_score');
    if (!policyDecision.allowed) {
      logger.warn(event.eventId, 'recalculate_score', policyDecision.reason);
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: policyDecision.reason
      };
    }

    const agentId = event.payload.agentId;
    if (!reputationPolicies.validateScoreUpdate(agentId, event.eventId)) {
      logger.error(event.eventId, 'validate_score_update', 'Falta agentId ou eventId. Reputação não pode ser alterada sem evento correlato.');
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: 'Validation failed: Cannot update reputation without a valid agentId and eventId.'
      };
    }

    const performedActions: AgentAction[] = [];
    const generatedArtifacts: string[] = [];

    // Mocking score calculation
    let scoreDelta = 0;
    let actionType = '';
    let reason = '';

    if (requiredAction === 'process_success') {
      scoreDelta = 10;
      actionType = 'recalculate_score';
      reason = 'SLA met and settlement completed successfully.';
    } else if (requiredAction === 'process_dispute' || requiredAction === 'process_sla_failure') {
      scoreDelta = -20;
      actionType = 'register_strike';
      reason = 'Dispute opened or SLA failed.';
      
      performedActions.push({
        actionId: `act_${Date.now()}_alert`,
        agentId: trustReputationAgentConfig.id,
        type: 'emit_risk_alert',
        payload: { agentId, riskLevel: 'medium', reason },
        status: 'success'
      });
      generatedArtifacts.push('RISK_ALERT_EVENT');
    } else if (requiredAction === 'process_slash') {
      scoreDelta = -50;
      actionType = 'register_strike';
      reason = 'On-chain slashing occurred.';
      
      performedActions.push({
        actionId: `act_${Date.now()}_alert`,
        agentId: trustReputationAgentConfig.id,
        type: 'emit_risk_alert',
        payload: { agentId, riskLevel: 'high', reason },
        status: 'success'
      });
      generatedArtifacts.push('CRITICAL_RISK_ALERT_EVENT');
    }

    performedActions.push({
      actionId: `act_${Date.now()}_score`,
      agentId: trustReputationAgentConfig.id,
      type: actionType,
      payload: { 
        agentId, 
        delta: scoreDelta, 
        eventId: event.eventId,
        evidence: reason
      },
      status: 'success'
    });

    performedActions.push({
      actionId: `act_${Date.now()}_history`,
      agentId: trustReputationAgentConfig.id,
      type: 'update_trust_history',
      payload: { agentId, eventId: event.eventId, eventType: event.type },
      status: 'success'
    });

    generatedArtifacts.push('TRUST_HISTORY_UPDATED');

    logger.info(event.eventId, requiredAction, 'Reputação processada com sucesso', { scoreDelta, agentId });

    return {
      success: true,
      actionsPerformed: performedActions,
      generatedArtifacts,
      reason: 'Reputation and trust history updated successfully.'
    };
    
  } catch (error: any) {
    logger.error(event.eventId, 'execution_error', error.message);
    return {
      success: false,
      actionsPerformed: [],
      generatedArtifacts: [],
      error: error.message,
      reason: 'Erro interno durante processamento de reputação.'
    };
  }
}
