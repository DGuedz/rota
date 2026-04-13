import { GitHubReadService } from '../apps/api/src/github/github.read.service.js';
import { GitHubWriteService } from '../apps/api/src/github/github.write.service.js';
import { getGitHubConfig } from '../apps/api/src/github/github.config.js';

async function testGitHubIntegration() {
  console.log('==========================================');
  console.log(' ROTA - GitHub API E2E Controlled Test ');
  console.log('==========================================\n');

  const config = getGitHubConfig();
  console.log(`Config: Owner=${config.owner}, Repo=${config.repo}, DryRun=${config.dryRun}`);
  console.log(`Token provided: ${config.token ? 'YES' : 'NO (Read-only / limited)'}\n`);

  const reader = new GitHubReadService();
  const writer = new GitHubWriteService();

  try {
    // 1. Teste de Leitura
    console.log('--- TEST 1: Leitura Básica do Repositório ---');
    const repoInfo = await reader.getRepoInfo();
    console.log(`✅ Repo Info: ${repoInfo.full_name} | Estrelas: ${repoInfo.stargazers_count}`);

    console.log('\n--- TEST 2: Leitura de Commits (main) ---');
    const commits = await reader.listRecentCommits('main', 3);
    console.log(`✅ Encontrados ${commits.length} commits recentes.`);
    commits.forEach((c: any) => console.log(`   - ${c.sha.substring(0, 7)}: ${c.commit.message.split('\n')[0]}`));

    // 2. Teste de Escrita com Guardrails (DryRun test)
    console.log('\n--- TEST 3: Escrita Controlada (Draft Release) ---');
    console.log('Tentando criar uma release draft... O guardrail deve interceptar se dryRun=true.');
    
    const draftRes = await writer.createReleaseDraft('v0.0.1-test', 'E2E Test Draft', 'Corpo do draft E2E');
    if (draftRes.simulated) {
      console.log('✅ SUCESSO: A ação foi interceptada pelo DryRun. Nenhuma release foi criada.');
    } else {
      console.log('⚠️ AVISO: DryRun estava desligado. A release real foi criada!', draftRes.url);
    }

    console.log('\n--- TEST 4: Escrita Controlada (PR Comment) ---');
    console.log('Simulando postagem de comentário em PR #1...');
    const commentRes = await writer.commentOnPullRequest(1, 'Teste de comentário E2E.');
    if (commentRes.simulated) {
      console.log('✅ SUCESSO: Comentário interceptado pelo DryRun.');
    } else {
      console.log('⚠️ AVISO: Comentário real postado!', commentRes.url);
    }

    console.log('\n==========================================');
    console.log(' Teste E2E Finalizado com Sucesso!');
    console.log('==========================================');
    
  } catch (error: any) {
    console.error('\n❌ Falha durante o teste E2E:', error.message);
    process.exit(1);
  }
}

testGitHubIntegration();
