import { RotaEvent, ExecutionResult, AgentAction } from '@rota/shared-types';
import { StructuredLogger } from '../shared/structured-logger';
import { getRequiredAction } from './triggers';
import { distributionPolicies } from './policies';
import { githubDistributionAgentConfig } from './agent.config';

// Importa os novos serviços do GitHub
import { GitHubReadService } from '../../../apps/api/src/github/github.read.service';
import { GitHubWriteService } from '../../../apps/api/src/github/github.write.service';

const logger = new StructuredLogger(githubDistributionAgentConfig.id);
const githubReader = new GitHubReadService();
const githubWriter = new GitHubWriteService();

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

    // Integramos a lógica com os serviços reais/dryRun do GitHub
    switch (requiredAction) {
      case 'update_docs_surface':
        // Simulação de leitura de commit para ver os arquivos que mudaram
        let filesChanged: any[] = [];
        if (event.payload.commitSha) {
          try {
            filesChanged = await githubReader.listChangedFiles(event.payload.commitSha);
          } catch(e) {
            // Em dryRun ou se falhar leitura, segue o baile
          }
        }
        
        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'update_docs_surface',
          targetPath: 'docs/',
          payload: { commitSha: event.payload.commitSha, filesRead: filesChanged.length },
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
        // AGORA USA A API REAL (mas com o guardrail global cuidando do dryRun)
        const tag = event.payload.tag || `v${Date.now()}`;
        const name = event.payload.name || `Auto-Release ${tag}`;
        const body = event.payload.notes || `Generated notes for ${tag}`;
        
        const releaseRes = await githubWriter.createReleaseDraft(tag, name, body);

        performedActions.push({
          actionId: `act_${Date.now()}`,
          agentId: githubDistributionAgentConfig.id,
          type: 'generate_release_draft',
          targetPath: 'github_releases',
          payload: { tag, notes: body, apiResult: releaseRes },
          status: policyDecision.requiresHumanApproval ? 'requires_approval' : 'success'
        });
        generatedArtifacts.push('RELEASE_DRAFT');
        break;

      case 'validate_skill_package':
        const isValid = distributionPolicies.canPublishSkill(event.payload.metadata);
        
        // Se temos um número de PR (ex: skill enviada por PR), podemos postar um comentário!
        if (event.payload.pullNumber) {
          const commentBody = isValid 
            ? `✅ **SKILL_PUBLISH_APPROVED**: The skill \`${event.payload.skillId}\` meets all distribution requirements.` 
            : `❌ **SKILL_README_FIX_SUGGESTION**: The skill \`${event.payload.skillId}\` is missing required manifest fields (description, commandExample, pricing).`;
          
          await githubWriter.commentOnPullRequest(event.payload.pullNumber, commentBody);
        }

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
