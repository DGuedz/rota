"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const domain_event_service_1 = require("./events/domain-event.service");
const execution_log_service_1 = require("./execution-logs/execution-log.service");
const event_bus_1 = require("./events/event-bus");
const dispatcher_1 = require("./agents/dispatcher");
const intent_repository_1 = require("./intents/intent.repository");
const intent_service_1 = require("./intents/intent.service");
const intent_routes_1 = require("./intents/intent.routes");
const rfq_repository_1 = require("./rfq/rfq.repository");
const rfq_service_1 = require("./rfq/rfq.service");
const bid_repository_1 = require("./bids/bid.repository");
const bid_service_1 = require("./bids/bid.service");
const rfq_routes_1 = require("./rfq/rfq.routes");
const stellar_client_1 = require("./stellar/stellar.client");
const xdr_builder_1 = require("./stellar/xdr-builder");
const escrow_repository_1 = require("./escrow/escrow.repository");
const escrow_service_1 = require("./escrow/escrow.service");
const escrow_routes_1 = require("./escrow/escrow.routes");
const x402_routes_1 = require("./payments/x402.routes");
const contract_events_service_1 = require("./contracts/contract-events.service");
const contract_events_indexer_1 = require("./contracts/contract-events.indexer");
const metrics_routes_1 = require("./accounting/metrics.routes");
const reputation_routes_1 = require("./reputation/reputation.routes");
// Carregar variáveis de ambiente
dotenv_1.default.config({ path: '../../.env' });
const app = (0, fastify_1.default)({
    logger: true
});
// Inicializando clientes de infraestrutura
const prisma = new client_1.PrismaClient();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
// Inicializando o Runtime do Workforce Agentic
const domainEventService = new domain_event_service_1.DomainEventService(prisma);
const executionLogService = new execution_log_service_1.ExecutionLogService(prisma);
const eventBus = new event_bus_1.RotaEventBus(domainEventService);
const agentDispatcher = new dispatcher_1.AgentDispatcher(eventBus, executionLogService, prisma);
// Inicializando Domínios Econômicos
const intentRepo = new intent_repository_1.IntentRepository(prisma);
const intentService = new intent_service_1.IntentService(intentRepo, eventBus);
const rfqRepo = new rfq_repository_1.RFQRepository(prisma);
const rfqService = new rfq_service_1.RFQService(rfqRepo, eventBus);
const bidRepo = new bid_repository_1.BidRepository(prisma);
const bidService = new bid_service_1.BidService(bidRepo, eventBus);
// Inicializando Soroban Bridge
const stellarClient = new stellar_client_1.StellarClient();
const xdrBuilder = new xdr_builder_1.XDRBuilder(stellarClient);
const escrowRepo = new escrow_repository_1.EscrowRepository(prisma);
const escrowService = new escrow_service_1.EscrowService(escrowRepo, xdrBuilder, stellarClient, eventBus);
// Inicializando Indexer Onchain
const contractEventsService = new contract_events_service_1.ContractEventsService(prisma, eventBus);
const contractIndexer = new contract_events_indexer_1.ContractEventsIndexer(prisma, stellarClient, contractEventsService);
// Registrar Rotas de Domínio
app.register(intent_routes_1.intentRoutes, { prefix: '/intents', intentService });
app.register(rfq_routes_1.rfqRoutes, { prefix: '/rfq', rfqService, bidService });
app.register(escrow_routes_1.escrowRoutes, { prefix: '/escrow', escrowService });
app.register(x402_routes_1.x402Routes, { prefix: '/payments' });
app.register(metrics_routes_1.metricsRoutes, { prefix: '/telemetry', prisma });
// Reputação
(0, reputation_routes_1.registerReputationRoutes)(app, { prisma });
// Conecta o Dispatcher ao barramento de eventos
agentDispatcher.start();
// Rota de Healthcheck do ROTA Core
app.get('/health', async (request, reply) => {
    let dbStatus = 'down';
    let redisStatus = 'down';
    try {
        await prisma.$queryRaw `SELECT 1`;
        dbStatus = 'up';
    }
    catch (e) {
        app.log.error(`Database connection failed: ${e.message}`);
    }
    try {
        const redisPing = await redis.ping();
        if (redisPing === 'PONG') {
            redisStatus = 'up';
        }
    }
    catch (e) {
        app.log.error(`Redis connection failed: ${e.message}`);
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
app.post('/test/dispatch-event', async (request, reply) => {
    const { source, type, payload } = request.body;
    if (!source || !type || !payload) {
        return reply.status(400).send({ error: 'Missing source, type, or payload' });
    }
    try {
        const eventId = await eventBus.publish(source, type, payload);
        return reply.send({
            message: 'Event published to ROTA Event Bus successfully',
            eventId,
            status: 'dispatched'
        });
    }
    catch (error) {
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
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map