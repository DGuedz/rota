/**
 * Adapter Write-Safe para a API do GitHub.
 * Todas as operações destrutivas ou de escrita passam por aqui.
 * O modo `dryRun` atua como guardrail global.
 */
export declare class GitHubWriteService {
    private client;
    private config;
    /**
     * Helper interno para logar a intenção de escrita e abortar se em dryRun.
     * Recebe um parâmetro isOverrideAllowed que permite bypassar o dryRun se
     * uma política específica (como liveComments) estiver ativada.
     */
    private checkGuardrails;
    /**
     * Cria um draft de release (Notas de Lançamento) sem publicar.
     * Útil para revisão humana antes do merge ou aprovação.
     */
    createReleaseDraft(tag: string, name: string, body: string): Promise<{
        success: boolean;
        simulated: boolean;
        action: string;
        url?: undefined;
        id?: undefined;
    } | {
        success: boolean;
        url: string;
        id: number;
        simulated?: undefined;
        action?: undefined;
    }>;
    /**
     * Adiciona um comentário em uma PR existente.
     * Ótimo para o distribution agent postar o DOCS_SYNC_REPORT ou resultados de validação.
     */
    commentOnPullRequest(pullNumber: number, body: string): Promise<{
        success: boolean;
        simulated: boolean;
        action: string;
        url?: undefined;
        id?: undefined;
    } | {
        success: boolean;
        url: string;
        id: number;
        simulated?: undefined;
        action?: undefined;
    }>;
    /**
     * Atualiza ou cria um arquivo no repositório (ex: CHANGELOG.md ou README.md).
     * ATENÇÃO: Restrito via playbooks. O Octokit não sabe disso, o guardrail deve ser do Agente.
     */
    updateFileSurface(filePath: string, contentBase64: string, message: string, sha?: string): Promise<{
        success: boolean;
        simulated: boolean;
        action: string;
        commit?: undefined;
    } | {
        success: boolean;
        commit: string | undefined;
        simulated?: undefined;
        action?: undefined;
    }>;
}
//# sourceMappingURL=github.write.service.d.ts.map