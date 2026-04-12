import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { publisherPolicies } from './policies';
import { skillPublisherAgentConfig } from './agent.config';

const logger = new StructuredLogger(skillPublisherAgentConfig.id);

export async function runPublisherAgent(event: RotaEvent): Promise<ExecutionResult> {
  logger.info(event.eventId, 'receive_event', `Iniciando empacotamento da skill: ${event.type}`);
  
  try {
    const requiredAction = getRequiredAction(event);
    if (!requiredAction) {
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: 'Evento não requer ação de empacotamento.'
      };
    }

    const policyDecision = publisherPolicies.validateAction('create_skill_md');
    if (!policyDecision.allowed) {
      logger.warn(event.eventId, 'create_skill_md', policyDecision.reason);
      return {
        success: false,
        actionsPerformed: [],
        generatedArtifacts: [],
        reason: policyDecision.reason
      };
    }

    const skillName = event.payload.skillName || `new-skill-${Date.now()}`;
    const basePath = `/skills/${skillName}`;
    
    const performedActions: AgentAction[] = [];
    const generatedArtifacts: string[] = [];

    if (requiredAction === 'package_skill') {
      // 1. Validar requisitos
      if (!publisherPolicies.validateSkillPackage(event.payload)) {
        logger.error(event.eventId, 'package_skill', 'Faltam metadados obrigatórios (comando ou schemas) para publicar a skill.');
        return {
          success: false,
          actionsPerformed: [],
          generatedArtifacts: [],
          reason: 'Validation failed: Missing mandatory metadata for skill publication.'
        };
      }

      // 2. Gerar skill.md
      performedActions.push({
        actionId: `act_${Date.now()}_1`,
        agentId: skillPublisherAgentConfig.id,
        type: 'create_skill_md',
        targetPath: `${basePath}/skill.md`,
        payload: { content: 'Draft skill manifest generated.' },
        status: 'success'
      });
      generatedArtifacts.push(`${basePath}/skill.md`);

      // 3. Gerar schema.json
      performedActions.push({
        actionId: `act_${Date.now()}_2`,
        agentId: skillPublisherAgentConfig.id,
        type: 'create_schema_json',
        targetPath: `${basePath}/schema.json`,
        payload: { content: 'Draft schema JSON generated.' },
        status: 'success'
      });
      generatedArtifacts.push(`${basePath}/schema.json`);

      // 4. Propor pricing (Requer aprovação)
      const pricingDecision = publisherPolicies.validateAction('create_pricing_md');
      performedActions.push({
        actionId: `act_${Date.now()}_3`,
        agentId: skillPublisherAgentConfig.id,
        type: 'create_pricing_md',
        targetPath: `${basePath}/pricing.md`,
        payload: { content: 'Placeholder for pricing model.' },
        status: pricingDecision.requiresHumanApproval ? 'requires_approval' : 'success'
      });
      generatedArtifacts.push(`${basePath}/pricing.md`);
    }

    logger.info(event.eventId, requiredAction, 'Skill empacotada com sucesso', { artifacts: generatedArtifacts });

    return {
      success: true,
      actionsPerformed: performedActions,
      generatedArtifacts,
      reason: 'Skill packaged successfully.'
    };
    
  } catch (error: any) {
    logger.error(event.eventId, 'execution_error', error.message);
    return {
      success: false,
      actionsPerformed: [],
      generatedArtifacts: [],
      error: error.message,
      reason: 'Erro interno durante empacotamento.'
    };
  }
}
