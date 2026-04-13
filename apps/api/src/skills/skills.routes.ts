import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { SkillMonetizationPolicy } from './skill-pricing.service';
import { walletRiskCheckService } from './wallet-risk-check.service';
import { ProofVerifierService } from './proof-verifier.service';
import { AccountingService } from '../accounting/accounting.service';
import { AgentEscrowInitSkill } from './agent-escrow-init.service';
import { StellarClient } from '../stellar/stellar.client';
import { WalletAbstractionService } from '../stellar/wallet/wallet-abstraction.service';
import { x402Middleware } from '../payments/x402.middleware';

export async function skillRoutes(fastify: FastifyInstance, options: { prisma: PrismaClient }) {
  const { prisma } = options;
  const accountingService = new AccountingService(prisma);
  const proofVerifierService = new ProofVerifierService(prisma);
  const stellarClient = new StellarClient();
  const walletAbstraction = new WalletAbstractionService(stellarClient);
  const goldenSkill = new AgentEscrowInitSkill(stellarClient, walletAbstraction);

  /**
   * Golden Skill: Inicialização Agentic de Escrow (Gasless)
   * Demonstra a Wallet Abstraction + x402 + Soroban
   */
  fastify.post('/agent-escrow-init', { preHandler: [x402Middleware] }, async (request: any, reply) => {
    try {
      const intent = request.body;
      const result = await goldenSkill.execute(intent);
      return reply.send(result);
    } catch (error: any) {
      request.log.error(`Golden Skill execution failed: ${error.message}`);
      return reply.status(500).send({ error: error.message });
    }
  });

  /**
   * Catálogo Público de Skills (com filtros de monetização)
   */
  fastify.get('/', async (request: any, reply) => {
    const { paid, escrow } = request.query;

    const whereClause: any = { isActive: true };
    
    // Filtragem simplificada de catálogo
    if (paid === 'true') {
      whereClause.priceMode = 'PAID_PER_EXECUTION';
    }
    if (escrow === 'true') {
      whereClause.priceMode = 'RFQ';
    }

    const skills = await prisma.skill.findMany({
      where: whereClause,
      include: { agent: { select: { displayName: true, reputationScore: true } } }
    });

    // Mapear com a política resolvida para devolver o SLA correto no frontend
    const catalog = skills.map(skill => {
      const policy = SkillMonetizationPolicy.resolve(skill);
      return {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        reputationThreshold: skill.reputationThreshold,
        monetization: {
          mode: skill.priceMode,
          isFree: policy.isFree,
          requiresX402: policy.requiresX402,
          requiresEscrow: policy.requiresEscrow,
          priceAmount: policy.priceAmount,
          assetCode: policy.assetCode,
        },
        provider: skill.agent
      };
    });

    return reply.send(catalog);
  });

  /**
   * Skill Execution Guard (D.3.2)
   * O endpoint único onde os agentes enviam os payloads da skill.
   */
  fastify.post('/:id/execute', async (request: any, reply) => {
    const { id } = request.params;
    
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return reply.status(404).send({ error: 'Skill not found' });

    // 1. Resolve a política da Skill no banco
    const policy = SkillMonetizationPolicy.resolve(skill);

    if (policy.rejectionReason) {
      return reply.status(403).send({ error: 'Skill unavailable', reason: policy.rejectionReason });
    }

    // 2. Se exige x402, checa manualmente a lógica do middleware de pagamentos
    if (policy.requiresX402) {
      // Nota: Idealmente isso usaria o x402Middleware injetado na rota dinamicamente.
      // Como a rota é curinga /:id/execute, fazemos o guard check inline.
      const paymentToken = request.headers['x-rota-payment-token'];
      if (!paymentToken) {
        return reply.status(402).header('Www-Authenticate', `X402 amount="${policy.priceAmount}" asset="${policy.assetCode}"`).send({
          error: 'Payment Required',
          message: 'Skill execution requires x402 payment token.',
        });
      }
      
      // Simula a verificação real delegando pro X402Service
      // await x402Service.verifyToken(...)
    }

    // 3. Se exige Escrow, barra execução direta
    if (policy.requiresEscrow) {
      return reply.status(400).send({
        error: 'Escrow Required',
        message: 'This skill operates via RFQ and Escrow. Please submit an Intent instead of direct execution.',
      });
    }

    // 4. Executa a Skill Mock (wallet-risk-check)
    let executionLog;
    try {
      const inputPayload = request.body || {};
      
      // Validação básica do Input baseada na skill
      if (skill.name === 'wallet-risk-check' && !inputPayload.walletAddress) {
        return reply.status(400).send({ error: 'Validation Error', message: 'walletAddress is required.' });
      }

      if (skill.name === 'proof-verifier' && (!inputPayload.proofPayload || !inputPayload.signatures)) {
        return reply.status(400).send({ error: 'Validation Error', message: 'proofPayload and signatures are required.' });
      }

      // [Accounting] Cria o log inicial de execução
      executionLog = await accountingService.logExecution({
        skillId: id,
        paymentMode: skill.priceMode as any,
        paymentAssetCode: policy.assetCode,
        amountCharged: policy.priceAmount,
        requestPayload: inputPayload
      }, 'INITIATED' as any); // Tipos ainda quebram sem prisma generate, forçando cast

      const startTime = Date.now();

      // Executar a skill solicitada
      let executionResult;

      if (skill.name === 'wallet-risk-check') {
        executionResult = await walletRiskCheckService.execute(inputPayload as any);
      } else if (skill.name === 'proof-verifier') {
        executionResult = await proofVerifierService.execute(inputPayload as any);
      } else {
        throw new Error(`Execution for skill ${skill.name} is not implemented.`);
      }

      const latencyMs = Date.now() - startTime;

      // [Accounting] Se pagou via x402, captura a receita
      if (policy.requiresX402 && policy.priceAmount) {
        await accountingService.captureRevenue({
          type: 'EXECUTION_CHARGED' as any,
          skillId: id,
          paymentExecutionLogId: executionLog.id,
          grossAmount: policy.priceAmount,
          assetCode: policy.assetCode,
        });
      }

      // [Accounting] Finaliza o log com sucesso
      await accountingService.updateExecutionStatus(
        executionLog.id, 
        'EXECUTED' as any, 
        latencyMs, 
        executionResult
      );

      // Logar a execução paga com sucesso no console
      fastify.log.info({
        event: 'skill.executed',
        skillId: id,
        paymentMode: policy.requiresX402 ? 'PAID' : 'FREE',
      });

      return reply.send({
        success: true,
        executionId: executionLog.id,
        output: executionResult
      });
    } catch (err: any) {
      fastify.log.error(err);

      // [Accounting] Registra a falha
      if (executionLog) {
        await accountingService.updateExecutionStatus(
          executionLog.id, 
          'FAILED' as any, 
          undefined, 
          { error: err.message }
        );
      }

      return reply.status(500).send({ error: 'Skill Execution Failed', message: err.message });
    }
  });
}
