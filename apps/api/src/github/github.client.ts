import { Octokit } from '@octokit/rest';
import { getGitHubConfig } from './github.config';

let clientInstance: Octokit | null = null;

/**
 * Retorna uma instância encapsulada e thread-safe do Octokit.
 * Garante que o cliente seja singleton no escopo da API.
 */
export function getGitHubClient(): Octokit {
  if (!clientInstance) {
    const config = getGitHubConfig();
    
    // Fallback de segurança: mesmo sem token, não crasheamos o app se estiver em dryRun.
    // Mas as leituras que requerem auth poderão falhar ou sofrer rate limit.
    const octokitOptions: any = {};
    if (config.token) {
      octokitOptions.auth = config.token;
    }
    
    clientInstance = new Octokit(octokitOptions);
    console.log(`[GitHub Client] Initialized. Auth provided: ${!!config.token} | DryRun mode: ${config.dryRun}`);
  }
  
  return clientInstance;
}
