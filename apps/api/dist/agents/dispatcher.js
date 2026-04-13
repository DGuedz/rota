"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDispatcher = void 0;
const run_1 = require("@rota/agents/router-agent/run");
const run_2 = require("@rota/agents/github-distribution-agent/run");
const run_3 = require("@rota/agents/skill-publisher-agent/run");
const run_4 = require("@rota/agents/trust-reputation-agent/run");
const run_5 = require("@rota/agents/protocol-watcher-agent/run");
const reputation_service_1 = require("../reputation/reputation.service");
class AgentDispatcher {
    eventBus;
    logService;
    reputationService;
    constructor(eventBus, logService, prisma) {
        this.eventBus = eventBus;
        this.logService = logService;
        this.reputationService = new reputation_service_1.ReputationService(prisma);
    }
    /**
     * Conecta o Event Bus ao Workforce Agentic.
     * O Dispatcher ouve todos os eventos validados e os encaminha para o Router Agent.
     */
    start() {
        this.eventBus.subscribe(async (domainEvent) => {
            const startTime = Date.now();
            // 1. Converte o evento recebido da fila BullMQ para a interface abstrata dos Agentes (RotaEvent)
            const rotaEvent = {
                eventId: domainEvent.eventId,
                source: domainEvent.source,
                type: domainEvent.type,
                payload: domainEvent.payload,
                timestamp: domainEvent.timestamp || new Date().toISOString()
            };
            try {
                // 2. Chama o Router Agent (A porta de entrada do workforce)
                const result = await (0, run_1.runRouter)(rotaEvent);
                const latency = Date.now() - startTime;
                // 3. Grava o log de execução detalhado do Router Agent no Banco
                try {
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
                }
                catch (e) {
                    // ignore DB in test
                }
                // 4. Se o Router determinou um agente de destino, despacha para o respectivo runtime
                if (result.targetAgent === 'github-distribution-agent') {
                    console.log(`[AgentDispatcher] Executing GitHub Distribution Agent for event ${domainEvent.eventId}`);
                    const distStartTime = Date.now();
                    const distResult = await (0, run_2.runDistributionAgent)(rotaEvent);
                    const distLatency = Date.now() - distStartTime;
                    try {
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
                    catch (e) {
                        // ignore DB
                    }
                }
                else if (result.targetAgent === 'skill-publisher-agent') {
                    console.log(`[AgentDispatcher] Executing Skill Publisher Agent for event ${domainEvent.eventId}`);
                    const pubStartTime = Date.now();
                    const pubResult = await (0, run_3.runSkillPublisherAgent)(rotaEvent);
                    const pubLatency = Date.now() - pubStartTime;
                    try {
                        await this.logService.logExecution({
                            agent: 'SKILL_PUBLISHER',
                            eventId: domainEvent.eventId,
                            source: domainEvent.source,
                            eventType: domainEvent.type,
                            status: pubResult.success ? 'SUCCESS' : 'FAILED',
                            decision: pubResult.reason,
                            input: { payload: domainEvent.payload },
                            output: { artifacts: pubResult.artifacts, actions: pubResult.actionsPerformed },
                            error: pubResult.error ? { message: pubResult.error } : undefined,
                            latencyMs: pubLatency,
                        });
                    }
                    catch (e) {
                        // ignore DB
                    }
                }
                else if (result.targetAgent === 'trust-reputation-agent') {
                    console.log(`[AgentDispatcher] Executing Trust & Reputation Agent for event ${domainEvent.eventId}`);
                    const trustStartTime = Date.now();
                    const trustResult = await (0, run_4.runTrustReputationAgent)(rotaEvent);
                    if (trustResult.status === "COMPLETED" &&
                        trustResult.signal &&
                        trustResult.targetAgentId &&
                        trustResult.sourceId) {
                        try {
                            await this.reputationService.applySignal({
                                agentId: trustResult.targetAgentId,
                                signal: trustResult.signal,
                                sourceId: trustResult.sourceId,
                                evidence: trustResult.evidence ?? null,
                            });
                            console.log(`[AgentDispatcher] Reputation signal applied successfully: ${trustResult.signal} to agent ${trustResult.targetAgentId}`);
                        }
                        catch (e) {
                            console.error(`[AgentDispatcher] Failed to apply reputation signal: ${e.message}`);
                        }
                    }
                    const trustLatency = Date.now() - trustStartTime;
                    try {
                        await this.logService.logExecution({
                            agent: 'TRUST_REPUTATION',
                            eventId: domainEvent.eventId,
                            source: domainEvent.source,
                            eventType: domainEvent.type,
                            status: trustResult.status === 'COMPLETED' ? 'SUCCESS' : trustResult.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED',
                            decision: trustResult.decision,
                            input: { payload: domainEvent.payload },
                            output: { trustResult },
                            latencyMs: trustLatency,
                        });
                    }
                    catch (e) {
                        // ignore DB
                    }
                }
                else if (result.targetAgent === 'protocol-watcher-agent') {
                    console.log(`[AgentDispatcher] Executing Protocol Watcher Agent for event ${domainEvent.eventId}`);
                    const watcherStartTime = Date.now();
                    const watcherResult = await (0, run_5.runProtocolWatcherAgent)(rotaEvent);
                    if (watcherResult.status === "COMPLETED" && watcherResult.classifiedImpact) {
                        console.log(`[AgentDispatcher] Protocol Observation created: Area ${watcherResult.classifiedImpact.area} | Urgency: ${watcherResult.classifiedImpact.urgency}`);
                    }
                    const watcherLatency = Date.now() - watcherStartTime;
                    try {
                        await this.logService.logExecution({
                            agent: 'PROTOCOL_WATCHER',
                            eventId: domainEvent.eventId,
                            source: domainEvent.source,
                            eventType: domainEvent.type,
                            status: watcherResult.status === 'COMPLETED' ? 'SUCCESS' : watcherResult.status === 'SKIPPED' ? 'SKIPPED' : 'FAILED',
                            decision: watcherResult.decision,
                            input: { payload: domainEvent.payload },
                            output: { watcherResult },
                            latencyMs: watcherLatency,
                        });
                    }
                    catch (e) {
                        // ignore DB
                    }
                }
                else if (result.targetAgent) {
                    console.warn(`[Dispatcher] ⚠️ No runtime handler for destination agent: ${result.targetAgent}`);
                }
                // Outros agentes podem ser adicionados aqui futuramente.
            }
            catch (error) {
                const latency = Date.now() - startTime;
                try {
                    await this.logService.logExecution({
                        agent: 'ROUTER',
                        eventId: domainEvent.eventId,
                        source: domainEvent.source,
                        eventType: domainEvent.type,
                        status: 'FAILED',
                        error: { message: error.message, stack: error.stack },
                        latencyMs: latency,
                    });
                }
                catch (e) { }
                throw error; // Repassa para o EventBus marcar como FAILED
            }
        });
        console.log('[AgentDispatcher] Started and listening to Event Bus.');
    }
}
exports.AgentDispatcher = AgentDispatcher;
//# sourceMappingURL=dispatcher.js.map