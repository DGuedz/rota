import { GitHubConfig } from './github.types';

export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN || '';
  const owner = process.env.GITHUB_REPO_OWNER || 'DGuedz';
  const repo = process.env.GITHUB_REPO_NAME || 'rota';

  // Por padrão, a execução destrutiva no GitHub (dryRun=false) é bloqueada a não ser que 
  // ROTA_GITHUB_DRY_RUN esteja explicitamente como "false".
  const dryRun = process.env.ROTA_GITHUB_DRY_RUN !== 'false';

  if (!token && !dryRun) {
    console.warn('[GitHub Config] AVISO: Operando com dryRun=false, mas GITHUB_TOKEN não está definido. As chamadas falharão na API.');
  }

  return {
    token,
    owner,
    repo,
    dryRun
  };
}
