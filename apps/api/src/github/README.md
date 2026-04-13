# Módulo GitHub API (Octokit) da ROTA

Este módulo fornece uma abstração segura e desacoplada para interações do backend da ROTA com a API do GitHub. 
O objetivo principal é suportar as ações do `github-distribution-agent`.

## Filosofia
- **Não vaze o Octokit**: O core business não deve saber que o Octokit existe. Deve usar as interfaces `github.read.service` e `github.write.service`.
- **DryRun por Padrão**: A variável `ROTA_GITHUB_DRY_RUN` é tratada como `true` a menos que declarada explicitamente como `false`. Isso previne commits acidentais, drafts vazados e quebra do repositório por bugs nos agentes.
- **Read/Write Split**: Métodos que consultam o estado do repositório não devem compartilhar classe ou permissão com métodos que modificam a superfície do projeto.

## Variáveis de Ambiente Obrigatórias
```bash
# Token de acesso pessoal (PAT) ou Token de Autenticação do App
GITHUB_TOKEN="ghp_xxx"

# Repositório de destino (Default: DGuedz/rota)
GITHUB_REPO_OWNER="DGuedz"
GITHUB_REPO_NAME="rota"

# Se true, as ações de write (github.write.service.ts) não farão chamadas destrutivas reais.
ROTA_GITHUB_DRY_RUN="true"
```
