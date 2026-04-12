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

    // Mocking execution logic based on required action
    switch (requiredAction) {
      case 'update_docs_surface':
        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'update_docs_surface',
          targetPath: 'docs/',
          payload: { commitSha: event.payload.commitSha },
          status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
        });
        generatedArtifacts.push('DOCS_SYNC_REPORT');
        break;

      case 'generate_changelog_entry':
        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'generate_changelog_entry',
          targetPath: 'CHANGELOG.md',
          payload: { prTitle: event.payload.title, prUrl: event.payload.url },
          status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
        });
        generatedArtifacts.push('CHANGELOG_ENTRY');
        break;

      case 'generate_release_draft':
        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'generate_release_draft',
          targetPath: 'github_releases',
          payload: { tag: event.payload.tag, notes: 'Auto-generated notes...' },
          status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
        });
        generatedArtifacts.push('RELEASE_DRAFT');
        break;

      case 'validate_skill_package':
        const isValid = distributionPolicies.canPublishSkill(event.payload.metadata);
        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'validate_skill_package',
          targetPath: `skills/${event.payload.skillId}`,
          payload: { valid: isValid, metadata: event.payload.metadata },
          status: 'success'
        });
        if (isValid) {
          generatedArtifacts.push('SKILL_PUBLISH_APPROVED');
        } else {
          generatedArtifacts.push('SKILL_README_FIX_SUGGESTION');
        }
        break;

      default:
        throw new Error(`Ação não implementada no runtime: ${requiredAction}`);
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
