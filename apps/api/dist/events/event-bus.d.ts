import { DomainEventService } from './domain-event.service';
import { EventSource } from '@prisma/client';
/**
 * Event Bus Interno da ROTA (BullMQ / Redis Persisted)
 * Substitui o EventEmitter em memória por uma fila resiliente.
 */
export declare class RotaEventBus {
    private eventService;
    private queue;
    private worker?;
    constructor(eventService: DomainEventService);
    /**
     * Publica um evento no barramento.
     * Passo 1: Persiste no PostgreSQL como PENDING.
     * Passo 2: Adiciona na fila BullMQ para os workers (Agentes).
     */
    publish(source: EventSource, type: string, payload: Record<string, any>, correlationId?: string, causationId?: string): Promise<string>;
    /**
     * Registra um listener master para o barramento via BullMQ Worker.
     * O Agent Dispatcher será o principal subscriber aqui.
     */
    subscribe(handler: (event: any) => Promise<void>): void;
    close(): Promise<void>;
}
//# sourceMappingURL=event-bus.d.ts.map