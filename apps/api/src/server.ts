import Fastify from 'fastify';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { PrismaClient, EventSource } from '@prisma/client';
import { DomainEventService } from './events/domain-event.service';
import { ExecutionLogService } from './execution-logs/execution-log.service';
import { RotaEventBus } from './events/event-bus';
import { AgentDispatcher } from './agents/dispatcher';
import { IntentRepository } from './intents/intent.repository';
import { IntentService } from './intents/intent.service';
import { intentRoutes } from './intents/intent.routes';
import { RFQRepository } from './rfq/rfq.repository';
import { RFQService } from './rfq/rfq.service';
import { BidRepository } from './bids/bid.repository';
import { BidService } from './bids/bid.service';
import { rfqRoutes } from './rfq/rfq.routes';
import { StellarClient } from './stellar/stellar.client';
import { XDRBuilder } from './stellar/xdr-builder';
import { EscrowRepository } from './escrow/escrow.repository';
import { EscrowService } from './escrow/escrow.service';
import { escrowRoutes } from './escrow/escrow.routes';
import { x402Routes } from './payments/x402.routes';
import { ContractEventsService } from './contracts/contract-events.service';
import { ContractEventsIndexer } from './contracts/contract-events.indexer';
import { metricsRoutes } from './accounting/metrics.routes';
import { registerReputationRoutes } from './reputation/reputation.routes';

// Carregar variáveis de ambiente
dotenv.config({ path: '../../.env' });

const app = Fastify({
  logger: true
});

// Inicializando clientes de infraestrutura
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Inicializando o Runtime do Workforce Agentic
const domainEventService = new DomainEventService(prisma);
const executionLogService = new ExecutionLogService(prisma);
const eventBus = new RotaEventBus(domainEventService);
const agentDispatcher = new AgentDispatcher(eventBus, executionLogService, prisma);

// Inicializando Domínios Econômicos
const intentRepo = new IntentRepository(prisma);
const intentService = new IntentService(intentRepo, eventBus);
const rfqRepo = new RFQRepository(prisma);
const rfqService = new RFQService(rfqRepo, eventBus);
const bidRepo = new BidRepository(prisma);
const bidService = new BidService(bidRepo, eventBus);

// Inicializando Soroban Bridge
const stellarClient = new StellarClient();
const xdrBuilder = new XDRBuilder(stellarClient);
const escrowRepo = new EscrowRepository(prisma);
const escrowService = new EscrowService(escrowRepo, xdrBuilder, stellarClient, eventBus);

// Inicializando Indexer Onchain
const contractEventsService = new ContractEventsService(prisma, eventBus);
const contractIndexer = new ContractEventsIndexer(prisma, stellarClient, contractEventsService);

// Registrar Rotas de Domínio
app.register(intentRoutes, { prefix: '/intents', intentService });
app.register(rfqRoutes, { prefix: '/rfq', rfqService, bidService });
  app.register(escrowRoutes, { prefix: '/escrow', escrowService });
  app.register(x402Routes, { prefix: '/payments' });
  app.register(metricsRoutes, { prefix: '/telemetry', prisma });

  // Reputação
  registerReputationRoutes(app, { prisma });

// Conecta o Dispatcher ao barramento de eventos
agentDispatcher.start();

// Rota de Healthcheck do ROTA Core
app.get('/health', async (request, reply) => {
  let dbStatus = 'down';
  let redisStatus = 'down';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch (e) {
    app.log.error('Database connection failed', e);
  }

  try {
    const redisPing = await redis.ping();
    if (redisPing === 'PONG') {
      redisStatus = 'up';
    }
  } catch (e) {
    app.log.error('Redis connection failed', e);
  }

  return {
    status: 'ok',
    version: '1.0.0',
    services: {
      api: 'up',
      database: dbStatus,
      redis: redisStatus,
      agentRuntime: 'up'
    },
    timestamp: new Date().toISOString()
  };
});

// Rota de Teste para Injetar Eventos no Runtime (Apenas Dev)
app.post('/test/dispatch-event', async (request: any, reply) => {
  const { source, type, payload } = request.body;
  
  if (!source || !type || !payload) {
    return reply.status(400).send({ error: 'Missing source, type, or payload' });
  }

  try {
    const eventId = await eventBus.publish(
      source as EventSource,
      type,
      payload
    );

    return reply.send({
      message: 'Event published to ROTA Event Bus successfully',
      eventId,
      status: 'dispatched'
    });
  } catch (error: any) {
    app.log.error(error);
    return reply.status(500).send({ error: error.message });
  }
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    
    // Inicia o polling do indexador da rede Soroban
    contractIndexer.start();
    
    app.log.info(`ROTA API Server listening on ${host}:${port}`);
    app.log.info(`Agent Runtime is active and listening for events.`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

