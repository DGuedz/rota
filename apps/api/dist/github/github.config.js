"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubConfig = getGitHubConfig;
function getGitHubConfig() {
    const token = process.env.GITHUB_TOKEN || '';
    const owner = process.env.GITHUB_REPO_OWNER || 'DGuedz';
    const repo = process.env.GITHUB_REPO_NAME || 'rota';
    // Por padrão, a execução destrutiva no GitHub (dryRun=false) é bloqueada a não ser que 
    // ROTA_GITHUB_DRY_RUN esteja explicitamente como "false".
    const dryRun = process.env.ROTA_GITHUB_DRY_RUN !== 'false';
    // Habilita ações reais especificamente para comentários de PR.
    const liveComments = process.env.ROTA_GITHUB_LIVE_COMMENTS === 'true';
    if (!token && (!dryRun || liveComments)) {
        console.warn('[GitHub Config] AVISO: Operando com write mode ativado, mas GITHUB_TOKEN não está definido. As chamadas falharão na API.');
    }
    return {
        token,
        owner,
        repo,
        dryRun,
        liveComments
    };
}
//# sourceMappingURL=github.config.js.map