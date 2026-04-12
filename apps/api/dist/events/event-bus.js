"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotaEventBus = void 0;
const events_1 = require("events");
/**
 * Event Bus Interno da ROTA (Em Memória / DB Persisted)
 * Em um cenário de produção escalado, o EventEmitter pode ser trocado por Redis Pub/Sub ou SQS.
 * Atualmente atende à restrição "Pode usar EventEmitter ou fila simples baseada em Redis".
 */
class RotaEventBus {
    eventService;
    emitter = new events_1.EventEmitter();
    constructor(eventService) {
        this.eventService = eventService;
    }
    /**
     * Publica um evento no barramento.
     * Passo 1: Persiste no PostgreSQL como PENDING.
     * Passo 2: Dispara o evento via EventEmitter para os workers (Agentes).
     */
    async publish(source, type, payload, correlationId, causationId) {
        try {
            // 1. Grava no banco
            const domainEvent = await this.eventService.createEvent(source, type, payload, correlationId, causationId);
            // 2. Emite internamente (Fire and forget na perspectiva do emissor)
            this.emitter.emit('rota_event', domainEvent);
            return domainEvent.eventId;
        }
        catch (error) {
            console.error(`[EventBus] Failed to publish event: ${type}`, error);
            throw error;
        }
    }
    /**
     * Registra um listener master para o barramento.
     * O Agent Dispatcher será o principal subscriber aqui.
     */
    subscribe(handler) {
        this.emitter.on('rota_event', async (domainEvent) => {
            try {
                await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSING');
                await handler(domainEvent);
                await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSED');
            }
            catch (error) {
                console.error(`[EventBus] Error handling event ${domainEvent.eventId}:`, error.message);
                await this.eventService.updateStatus(domainEvent.eventId, 'FAILED', error.message);
            }
        });
    }
}
exports.RotaEventBus = RotaEventBus;
//# sourceMappingURL=event-bus.js.map