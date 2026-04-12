import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { distributionPolicies } from './policies';
import { githubDistributionAgentConfig } from './agent.config';

const logger = new StructuredLogger(githubDistributionAgentConfig.id);

export async function runDistributionAgent(event: RotaEvent): Promise<ExecutionResult> {
  logger.info(event.eventId, 'receive_event', `Iniciando processamento de evento: ${event.type}`);
  
  try {
    const requiredAction = getRequiredAction(event);
    if (!requiredAction) {
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: 'Evento não suportado por este agente.'
      };
    }

    const policyDecision = distributionPolicies.validateAction(requiredAction);
    if (!policyDecision.allowed) {
      logger.warn(event.eventId, requiredAction, policyDecision.reason);
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: policyDecision.reason
      };
    }

    const performedActions: AgentAction[] = [];
    const generatedArtifacts: string[] = [];

    // Mocking execution logic based on trigger
    if (requiredAction === 'generate_changelog') {
      performedActions.push({
        actionId: `act_${Date.now()}`,
        agentId: githubDistributionAgentConfig.id,
        type: 'update_changelog',
        targetPath: 'CHANGELOG.md',
        payload: { commitMsg: event.payload.message },
        status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
      });
      generatedArtifacts.push('CHANGELOG_ENTRY');
    } else if (requiredAction === 'validate_publish_checklist') {
      const isValid = distributionPolicies.canPublishSkill(event.payload.metadata);
      if (isValid) {
        // Gera um evento downstream para o skill-publisher-agent (simulado)
        generatedArtifacts.push('SKILL_PUBLISH_CHECKLIST_APPROVED');
      } else {
        generatedArtifacts.push('README_FIX_SUGGESTION');
      }
      performedActions.push({
        actionId: `act_${Date.now()}`,
        agentId: githubDistributionAgentConfig.id,
        type: 'validate_readme',
        payload: { valid: isValid },
        status: 'success'
      });
    }

    logger.info(event.eventId, requiredAction, 'Ação executada com sucesso', { artifacts: generatedArtifacts });

    return {
      success: true,
      actionsPerformed: performedActions,
      generatedArtifacts,
      reason: 'Ações de distribuição completadas com sucesso.'
    };
    
  } catch (error: any) {
    logger.error(event.eventId, 'execution_error', error.message);
    return {
      success: false,
      actionsPerformed: [],
      generatedArtifacts: [],
      error: error.message,
      reason: 'Erro interno durante execução.'
    };
  }
}
