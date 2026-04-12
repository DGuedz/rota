import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { watcherPolicies } from './policies';
import { protocolWatcherAgentConfig } from './agent.config';

const logger = new StructuredLogger(protocolWatcherAgentConfig.id);

export async function runWatcherAgent(event: RotaEvent): Promise<ExecutionResult> {
  logger.info(event.eventId, 'receive_event', `Iniciando análise de evento de protocolo: ${event.type}`);
  
  try {
    const requiredAction = getRequiredAction(event);
    if (!requiredAction) {
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: 'Evento de protocolo não suportado ou irrelevante.'
      };
    }

    const policyDecision = watcherPolicies.validateAction('summarize_changes');
    if (!policyDecision.allowed) {
      logger.warn(event.eventId, 'summarize_changes', policyDecision.reason);
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: policyDecision.reason
      };
    }

    const performedActions: AgentAction[] = [];
    const generatedArtifacts: string[] = [];

    // Mocking analysis
    const impactClassification = event.payload.impact || 'low';
    
    performedActions.push({
      actionId: `act_${Date.now()}_1`,
      agentId: protocolWatcherAgentConfig.id,
      type: 'summarize_changes',
      payload: { summary: `Update detected on ${event.source}: ${event.type}`, impact: impactClassification },
      status: 'success'
    });
    
    performedActions.push({
      actionId: `act_${Date.now()}_2`,
      agentId: protocolWatcherAgentConfig.id,
      type: 'open_internal_issue',
      payload: { title: `[Watcher] Review impact of ${event.type}`, impact: impactClassification },
      status: 'success'
    });
    
    generatedArtifacts.push('WATCHER_REPORT_DRAFT');
    generatedArtifacts.push('GITHUB_ISSUE_PAYLOAD');

    logger.info(event.eventId, requiredAction, 'Análise de protocolo concluída com sucesso', { artifacts: generatedArtifacts, impact: impactClassification });

    return {
      success: true,
      actionsPerformed: performedActions,
      generatedArtifacts,
      reason: 'Protocol watched and issue mapped successfully.'
    };
    
  } catch (error: any) {
    logger.error(event.eventId, 'execution_error', error.message);
    return {
      success: false,
      actionsPerformed: [],
      generatedArtifacts: [],
      error: error.message,
      reason: 'Erro interno durante análise de protocolo.'
    };
  }
}
