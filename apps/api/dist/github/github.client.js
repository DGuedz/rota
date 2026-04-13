"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubClient = getGitHubClient;
const rest_1 = require("@octokit/rest");
const github_config_1 = require("./github.config");
let clientInstance = null;
/**
 * Retorna uma instância encapsulada e thread-safe do Octokit.
 * Garante que o cliente seja singleton no escopo da API.
 */
function getGitHubClient() {
    if (!clientInstance) {
        const config = (0, github_config_1.getGitHubConfig)();
        // Fallback de segurança: mesmo sem token, não crasheamos o app se estiver em dryRun.
        // Mas as leituras que requerem auth poderão falhar ou sofrer rate limit.
        const octokitOptions = {};
        if (config.token) {
            octokitOptions.auth = config.token;
        }
        clientInstance = new rest_1.Octokit(octokitOptions);
        console.log(`[GitHub Client] Initialized. Auth provided: ${!!config.token} | DryRun mode: ${config.dryRun}`);
    }
    return clientInstance;
}
//# sourceMappingURL=github.client.js.map