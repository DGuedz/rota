import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { publisherPolicies } from './policies';
import { skillPublisherAgentConfig } from './agent.config';
import { PublishService } from './publish.service';

const logger = new StructuredLogger(skillPublisherAgentConfig.id);

export async function runSkillPublisherAgent(event: RotaEvent): Promise<ExecutionResult> {
  logger.info(event.eventId, "receive_event", `Received event: ${event.type}`);

  const requiredAction = getRequiredAction(event);
  
  if (!requiredAction) {
    logger.warn(event.eventId, "map_action", `No action mapped for event type: ${event.type}`);
    return {
      success: false,
      reason: "unsupported_event",
      actionsPerformed: [],
      generatedArtifacts: []
    };
  }

  const policyDecision = publisherPolicies.validateAction(requiredAction);
  if (!policyDecision.allowed) {
    logger.error(event.eventId, "policy_check", `Action blocked by policy: ${requiredAction}`, { reason: policyDecision.reason });
    return {
      success: false,
      reason: "blocked_by_policy",
      actionsPerformed: [],
      generatedArtifacts: [],
      error: policyDecision.reason
    };
  }

  const performedActions: AgentAction[] = [];
  const generatedArtifacts: string[] = [];

  try {
    switch (requiredAction) {
      case 'validate_skill_candidate':
        const isValid = publisherPolicies.hasMinimumManifest(event.payload.metadata);
        performedActions.push({
          actionId: `pub_${Date.now()}`,
          agentId: skillPublisherAgentConfig.id,
          type: 'validate_skill_candidate',
          targetPath: `skills/candidate/${event.payload.id || 'unknown'}`,
          payload: { valid: isValid },
          status: 'success'
        });
        generatedArtifacts.push(isValid ? 'CANDIDATE_APPROVED' : 'CANDIDATE_REJECTED');
        break;

      case 'generate_skill_package':
        // Geração determinística via PublishService
        const pubSvcResult = PublishService.generateSkillPackage(event.payload as any);
        
        if (!pubSvcResult.success) {
          throw new Error(`Package generation failed: ${pubSvcResult.errors?.join(', ')}`);
        }

        performedActions.push({
          actionId: `pub_${Date.now()}`,
          agentId: skillPublisherAgentConfig.id,
          type: 'generate_skill_package',
          targetPath: `skills/${event.payload.id}`,
          payload: { generated: true, files: pubSvcResult.generatedPaths },
          status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
        });
        generatedArtifacts.push('SKILL_PACKAGE_SCAFFOLDED');
        break;

      default:
        throw new Error(`Unhandled action in runtime: ${requiredAction}`);
    }

    logger.info(event.eventId, "execution_complete", `Agent execution completed successfully`, { generatedArtifacts });

    return {
      success: true,
      reason: 'Agent execution completed successfully',
      actionsPerformed: performedActions,
      generatedArtifacts: generatedArtifacts,
      artifacts: generatedArtifacts
    };

  } catch (error: any) {
    logger.error(event.eventId, "execution_failed", `Execution failed: ${error.message}`, { error });
    return {
      success: false,
      reason: `Execution failed: ${error.message}`,
      actionsPerformed: performedActions,
      generatedArtifacts: generatedArtifacts,
      error: error.message
    };
  }
}
