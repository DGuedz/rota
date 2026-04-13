import { getGitHubClient } from './github.client';
import { getGitHubConfig } from './github.config';

/**
 * Adapter Read-Only para a API do GitHub.
 * Encapsula consultas ao repositório, garantindo tratamento de erros e fallback para modo seguro.
 */
export class GitHubReadService {
  private client = getGitHubClient();
  private config = getGitHubConfig();

  /**
   * Obtém informações básicas do repositório configurado.
   */
  async getRepoInfo() {
    try {
      const { data } = await this.client.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });
      return data;
    } catch (error: any) {
      console.error(`[GitHubReadService] Failed to get repo info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna os detalhes de uma branch específica.
   */
  async getBranch(branchName: string) {
    try {
      const { data } = await this.client.repos.getBranch({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: branchName,
      });
      return data;
    } catch (error: any) {
      console.error(`[GitHubReadService] Failed to get branch ${branchName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista os commits mais recentes de uma branch.
   */
  async listRecentCommits(branchName: string, limit: number = 10) {
    try {
      const { data } = await this.client.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        sha: branchName,
        per_page: limit,
      });
      return data;
    } catch (error: any) {
      console.error(`[GitHubReadService] Failed to list commits on ${branchName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um Pull Request.
   */
  async getPullRequest(pullNumber: number) {
    try {
      const { data } = await this.client.pulls.get({
        owner: this.config.owner,
        repo: this.config.repo,
        pull_number: pullNumber,
      });
      return data;
    } catch (error: any) {
      console.error(`[GitHubReadService] Failed to get PR #${pullNumber}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista os arquivos modificados em um commit específico.
   */
  async listChangedFiles(commitSha: string) {
    try {
      const { data } = await this.client.repos.getCommit({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: commitSha,
      });
      return data.files || [];
    } catch (error: any) {
      console.error(`[GitHubReadService] Failed to get changed files for commit ${commitSha}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém a release mais recente.
   */
  async getLatestRelease() {
    try {
      const { data } = await this.client.repos.getLatestRelease({
        owner: this.config.owner,
        repo: this.config.repo,
      });
      return data;
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`[GitHubReadService] No releases found for repo.`);
        return null;
      }
      console.error(`[GitHubReadService] Failed to get latest release: ${error.message}`);
      throw error;
    }
  }
}
