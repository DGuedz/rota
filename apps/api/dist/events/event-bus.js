"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEventBus = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
/**
 * Event Bus Interno da ROTA (BullMQ / Redis Persisted)
 * Substitui o EventEmitter em memória por uma fila resiliente.
 */
class RotaEventBus {
    eventService;
    queue;
    worker;
    constructor(eventService) {
        this.eventService = eventService;
        this.queue = new bullmq_1.Queue('rota-events', { connection: redisConnection });
    }
    /**
     * Publica um evento no barramento.
     * Passo 1: Persiste no PostgreSQL como PENDING.
     * Passo 2: Adiciona na fila BullMQ para os workers (Agentes).
     */
    async publish(source, type, payload, correlationId, causationId) {
        try {
            // 1. Grava no banco
            const domainEvent = await this.eventService.createEvent(source, type, payload, correlationId, causationId);
            const mappedEvent = {
                eventId: domainEvent.eventId, // <-- Alterado de 'id' para 'eventId' para o Dispatcher
                type: domainEvent.type,
                source: domainEvent.source,
                payload: domainEvent.payload,
                timestamp: domainEvent.receivedAt ? domainEvent.receivedAt.toISOString() : new Date().toISOString()
            };
            // 2. Adiciona na fila (garante idempotência via jobId)
            await this.queue.add(type, mappedEvent, {
                jobId: domainEvent.eventId,
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 }
            });
            return domainEvent.eventId;
        }
        catch (error) {
            console.error(`[EventBus] Failed to publish event: ${type}`, error);
            throw error;
        }
    }
    /**
     * Registra um listener master para o barramento via BullMQ Worker.
     * O Agent Dispatcher será o principal subscriber aqui.
     */
    subscribe(handler) {
        this.worker = new bullmq_1.Worker('rota-events', async (job) => {
            const domainEvent = job.data;
            try {
                if (domainEvent.eventId) {
                    try {
                        await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSING');
                    }
                    catch (e) {
                        // Ignore
                    }
                }
                await handler(domainEvent);
                if (domainEvent.eventId) {
                    try {
                        await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSED');
                    }
                    catch (e) {
                        // Ignore
                    }
                }
            }
            catch (error) {
                console.error(`[EventBus] Error handling event ${domainEvent.eventId}:`, error.message);
                if (domainEvent.eventId) {
                    try {
                        await this.eventService.updateStatus(domainEvent.eventId, 'FAILED', error.message);
                    }
                    catch (e) {
                        // Ignore
                    }
                }
                throw error; // Let BullMQ retry
            }
        }, { connection: redisConnection });
        this.worker.on('failed', (job, err) => {
            console.error(`[EventBus] Job ${job?.id} failed with error ${err.message}`);
        });
    }
    async close() {
        await this.worker?.close();
        await this.queue.close();
        redisConnection.disconnect();
    }
}
exports.RotaEventBus = RotaEventBus;
//# sourceMappingURL=event-bus.js.map