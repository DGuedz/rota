"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubWriteService = void 0;
const github_client_1 = require("./github.client");
const github_config_1 = require("./github.config");
/**
 * Adapter Write-Safe para a API do GitHub.
 * Todas as operações destrutivas ou de escrita passam por aqui.
 * O modo `dryRun` atua como guardrail global.
 */
class GitHubWriteService {
    client = (0, github_client_1.getGitHubClient)();
    config = (0, github_config_1.getGitHubConfig)();
    /**
     * Helper interno para logar a intenção de escrita e abortar se em dryRun.
     * Recebe um parâmetro isOverrideAllowed que permite bypassar o dryRun se
     * uma política específica (como liveComments) estiver ativada.
     */
    checkGuardrails(actionName, metadata, isOverrideAllowed = false) {
        if (this.config.dryRun && !isOverrideAllowed) {
            console.log(`[GitHubWriteService:GUARDRAIL] Action blocked by dryRun: ${actionName}`);
            console.log(`[GitHubWriteService:METADATA]`, JSON.stringify(metadata, null, 2));
            return false;
        }
        if (isOverrideAllowed && this.config.dryRun) {
            console.log(`[GitHubWriteService:GUARDRAIL] Bypassing dryRun for explicitly allowed action: ${actionName}`);
        }
        return true;
    }
    /**
     * Cria um draft de release (Notas de Lançamento) sem publicar.
     * Útil para revisão humana antes do merge ou aprovação.
     */
    async createReleaseDraft(tag, name, body) {
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
        }
        catch (error) {
            console.error(`[GitHubWriteService] Failed to create release draft: ${error.message}`);
            throw error;
        }
    }
    /**
     * Adiciona um comentário em uma PR existente.
     * Ótimo para o distribution agent postar o DOCS_SYNC_REPORT ou resultados de validação.
     */
    async commentOnPullRequest(pullNumber, body) {
        if (!this.checkGuardrails('commentOnPullRequest', { pullNumber }, this.config.liveComments)) {
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
        }
        catch (error) {
            console.error(`[GitHubWriteService] Failed to post comment on PR #${pullNumber}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Atualiza ou cria um arquivo no repositório (ex: CHANGELOG.md ou README.md).
     * ATENÇÃO: Restrito via playbooks. O Octokit não sabe disso, o guardrail deve ser do Agente.
     */
    async updateFileSurface(filePath, contentBase64, message, sha) {
        if (!this.checkGuardrails('updateFileSurface', { filePath, message })) {
            return { success: true, simulated: true, action: 'updateFileSurface' };
        }
        try {
            const params = {
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
        }
        catch (error) {
            console.error(`[GitHubWriteService] Failed to update file ${filePath}: ${error.message}`);
            throw error;
        }
    }
}
exports.GitHubWriteService = GitHubWriteService;
//# sourceMappingURL=github.write.service.js.map