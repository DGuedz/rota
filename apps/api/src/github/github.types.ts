export interface GitHubConfig {
  /** 
   * GitHub Personal Access Token (PAT) ou Token de App. 
   * Usado para autenticação nas chamadas da API via Octokit.
   */
  token: string;
  
  /**
   * Dono do repositório (owner/org). Ex: "DGuedz"
   */
  owner: string;
  
  /**
   * Nome do repositório. Ex: "rota"
   */
  repo: string;
  
  /**
   * Se true, nenhuma operação destrutiva (write) será executada no GitHub.
   * O sistema apenas fará log da intenção. Padrão: true (Segurança by Default).
   */
  dryRun: boolean;
  
  /**
   * Se true, permite especificamente a postagem real de comentários em PRs,
   * mesmo se o dryRun global estiver ativado. Padrão: false.
   */
  liveComments: boolean;
}
