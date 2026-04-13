import { GitHubWriteService } from '../apps/api/src/github/github.write.service.js';
import { getGitHubConfig } from '../apps/api/src/github/github.config.js';

/**
 * Script de teste controlado para F.3 / Fase G.1.
 * Testa se um comentário pode ser criado em um PR especifico quando a flag
 * ROTA_GITHUB_LIVE_COMMENTS está ativada, provando o funcionamento do write service.
 */
async function testLiveComment() {
  console.log('==========================================');
  console.log(' ROTA - Teste Real de Comentário em PR ');
  console.log('==========================================\n');

  // Configurar environment explicitamente para o teste
  process.env.ROTA_GITHUB_LIVE_COMMENTS = 'true';
  process.env.ROTA_GITHUB_DRY_RUN = 'true'; // O Dry Run continua ativo para todo o resto

  const config = getGitHubConfig();
  console.log(`Config Ativa:`);
  console.log(`- Owner: ${config.owner}`);
  console.log(`- Repo: ${config.repo}`);
  console.log(`- Global Dry Run: ${config.dryRun}`);
  console.log(`- Live Comments Allowed: ${config.liveComments}`);
  console.log(`- Token presente: ${!!config.token}\n`);

  if (!config.token) {
    console.log('⚠️ AVISO: Sem GITHUB_TOKEN, o teste falhará com erro 401 Unauthorized.');
    console.log('Por favor, defina GITHUB_TOKEN no .env antes de prosseguir se quiser ver o comentário no Github.\n');
  }

  const writer = new GitHubWriteService();

  try {
    // Para evitar sujar o repositório real, vamos pedir para o usuário apontar
    // o número do PR que deseja testar, ou usar um PR default fictício (ex: PR #1).
    const PR_NUMBER = parseInt(process.env.TEST_PR_NUMBER || '1', 10);
    
    console.log(`Tentando postar um comentário REAL no PR #${PR_NUMBER}...`);
    console.log('Ação: commentOnPullRequest');
    
    const res = await writer.commentOnPullRequest(
      PR_NUMBER,
      '🤖 **ROTA Agentic Workforce**: Teste de comunicação (live mode on). Tudo operando conforme esperado.'
    );

    if (res.simulated) {
      console.log('❌ O guardrail bloqueou a ação. Verifique a lógica de override!');
    } else {
      console.log('✅ SUCESSO REAL: Comentário criado!');
      console.log(`   Link: ${res.url}`);
    }

    console.log('\n==========================================');
    console.log(' Verificação de Segurança (Draft Release) ');
    console.log('==========================================\n');
    console.log('Tentando criar um release draft para confirmar que AINDA ESTAMOS em Dry Run para as outras operações...\n');

    const draftRes = await writer.createReleaseDraft('v0.0.1-safe', 'Draft Seguro', 'Teste de guardrail');
    
    if (draftRes.simulated) {
      console.log('✅ SUCESSO DE SEGURANÇA: Draft interceptado pelo dryRun!');
    } else {
      console.log('❌ FALHA CRÍTICA DE SEGURANÇA: O draft foi criado!');
    }

  } catch (error: any) {
    console.error('\n❌ Falha durante a execução da API do GitHub:', error.message);
    if (error.status === 404) {
      console.log('Dica: O PR informado pode não existir no repositório configurado.');
    }
  }
}

testLiveComment();
