import { getGitHubClient } from './github.client';
import { getGitHubConfig } from './github.config';

/**
 * Adapter Write-Safe para a API do GitHub.
 * Todas as operações destrutivas ou de escrita passam por aqui.
 * O modo `dryRun` atua como guardrail global.
 */
export class GitHubWriteService {
  private client = getGitHubClient();
  private config = getGitHubConfig();

  /**
   * Helper interno para logar a intenção de escrita e abortar se em dryRun.
   */
  private checkGuardrails(actionName: string, metadata: any): boolean {
    if (this.config.dryRun) {
      console.log(`[GitHubWriteService:GUARDRAIL] Action blocked by dryRun: ${actionName}`);
      console.log(`[GitHubWriteService:METADATA]`, JSON.stringify(metadata, null, 2));
      return false;
    }
    return true;
  }

  /**
   * Cria um draft de release (Notas de Lançamento) sem publicar.
   * Útil para revisão humana antes do merge ou aprovação.
   */
  async createReleaseDraft(tag: string, name: string, body: string) {
    if (!this.checkGuardrails('createReleaseDraft', { tag, name })) {
      return { success: true, simulated: true, action: 'createReleaseDraft' };
    }

    try {
      const { data } = await this.client.repos.createRelease({
        owner: this.config.owner,
        repo: this.config.repo,
        tag_name: tag,
        name: name,
        body: body,
        draft: true, // Sempre cria como draft (nível 2 de autonomia)
        prerelease: false,
      });
      console.log(`[GitHubWriteService] Release draft created: ${data.html_url}`);
      return { success: true, url: data.html_url, id: data.id };
    } catch (error: any) {
      console.error(`[GitHubWriteService] Failed to create release draft: ${error.message}`);
      throw error;
    }
  }

  /**
   * Adiciona um comentário em uma PR existente.
   * Ótimo para o distribution agent postar o DOCS_SYNC_REPORT ou resultados de validação.
   */
  async commentOnPullRequest(pullNumber: number, body: string) {
    if (!this.checkGuardrails('commentOnPullRequest', { pullNumber })) {
      return { success: true, simulated: true, action: 'commentOnPullRequest' };
    }

    try {
      const { data } = await this.client.issues.createComment({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: pullNumber, // PRs são tratadas como issues na API para comentários
        body: body,
      });
      console.log(`[GitHubWriteService] Comment posted on PR #${pullNumber}: ${data.html_url}`);
      return { success: true, url: data.html_url, id: data.id };
    } catch (error: any) {
      console.error(`[GitHubWriteService] Failed to post comment on PR #${pullNumber}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Atualiza ou cria um arquivo no repositório (ex: CHANGELOG.md ou README.md).
   * ATENÇÃO: Restrito via playbooks. O Octokit não sabe disso, o guardrail deve ser do Agente.
   */
  async updateFileSurface(filePath: string, contentBase64: string, message: string, sha?: string) {
    if (!this.checkGuardrails('updateFileSurface', { filePath, message })) {
      return { success: true, simulated: true, action: 'updateFileSurface' };
    }

    try {
      const params: any = {
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message: message,
        content: contentBase64,
      };
      
      if (sha) {
        params.sha = sha;
      }

      const { data } = await this.client.repos.createOrUpdateFileContents(params);
      console.log(`[GitHubWriteService] File updated: ${filePath}`);
      return { success: true, commit: data.commit.sha };
    } catch (error: any) {
      console.error(`[GitHubWriteService] Failed to update file ${filePath}: ${error.message}`);
      throw error;
    }
  }
}
