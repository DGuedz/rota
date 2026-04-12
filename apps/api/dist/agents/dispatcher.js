"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDispatcher = void 0;
const run_1 = require("@rota/agents/router-agent/run");
const run_2 = require("@rota/agents/github-distribution-agent/run");
class AgentDispatcher {
    eventBus;
    logService;
    constructor(eventBus, logService) {
        this.eventBus = eventBus;
        this.logService = logService;
    }
    /**
     * Conecta o Event Bus ao Workforce Agentic.
     * O Dispatcher ouve todos os eventos validados e os encaminha para o Router Agent.
     */
    start() {
        this.eventBus.subscribe(async (domainEvent) => {
            const startTime = Date.now();
            // 1. Converte o DomainEvent do Prisma para a interface abstrata dos Agentes (RotaEvent)
            const rotaEvent = {
                eventId: domainEvent.eventId,
                source: domainEvent.source,
                type: domainEvent.type,
                payload: domainEvent.payload,
                timestamp: domainEvent.receivedAt.toISOString()
            };
            try {
                // 2. Chama o Router Agent (A porta de entrada do workforce)
                const result = await (0, run_1.runRouter)(rotaEvent);
                const latency = Date.now() - startTime;
                // 3. Grava o log de execução detalhado do Router Agent no Banco
                await this.logService.logExecution({
                    agent: 'ROUTER',
                    eventId: domainEvent.eventId,
                    source: domainEvent.source,
                    eventType: domainEvent.type,
                    status: result.dispatched ? 'DISPATCHED' : 'SKIPPED',
                    decision: result.reason,
                    input: { payload: domainEvent.payload },
                    output: { targetAgent: result.targetAgent },
                    latencyMs: latency,
                });
                // 4. Se o Router determinou um agente de destino, despacha para o respectivo runtime
                if (result.targetAgent === 'github-distribution-agent') {
                    console.log(`[AgentDispatcher] Executing GitHub Distribution Agent for event ${domainEvent.eventId}`);
                    const distStartTime = Date.now();
                    const distResult = await (0, run_2.runDistributionAgent)(rotaEvent);
                    const distLatency = Date.now() - distStartTime;
                    await this.logService.logExecution({
                        agent: 'DISTRIBUTION',
                        eventId: domainEvent.eventId,
                        source: domainEvent.source,
                        eventType: domainEvent.type,
                        status: distResult.success ? 'SUCCESS' : 'FAILED',
                        decision: distResult.reason,
                        input: { payload: domainEvent.payload },
                        output: { artifacts: distResult.generatedArtifacts, actions: distResult.actionsPerformed },
                        error: distResult.error ? { message: distResult.error } : undefined,
                        latencyMs: distLatency,
                    });
                }
                // Outros agentes podem ser adicionados aqui futuramente.
            }
            catch (error) {
                const latency = Date.now() - startTime;
                await this.logService.logExecution({
                    agent: 'ROUTER',
                    eventId: domainEvent.eventId,
                    source: domainEvent.source,
                    eventType: domainEvent.type,
                    status: 'FAILED',
                    error: { message: error.message, stack: error.stack },
                    latencyMs: latency,
                });
                throw error; // Repassa para o EventBus marcar como FAILED
            }
        });
        console.log('[AgentDispatcher] Started and listening to Event Bus.');
    }
}
exports.AgentDispatcher = AgentDispatcher;
//# sourceMappingURL=dispatcher.js.map