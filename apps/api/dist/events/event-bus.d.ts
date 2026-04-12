import { DomainEventService } from './domain-event.service';
import { EventSource } from '@prisma/client';
/**
 * Event Bus Interno da ROTA (Em Memória / DB Persisted)
 * Em um cenário de produção escalado, o EventEmitter pode ser trocado por Redis Pub/Sub ou SQS.
 * Atualmente atende à restrição "Pode usar EventEmitter ou fila simples baseada em Redis".
 */
export declare class RotaEventBus {
    private eventService;
    private emitter;
    constructor(eventService: DomainEventService);
    /**
     * Publica um evento no barramento.
     * Passo 1: Persiste no PostgreSQL como PENDING.
     * Passo 2: Dispara o evento via EventEmitter para os workers (Agentes).
     */
    publish(source: EventSource, type: string, payload: Record<string, any>, correlationId?: string, causationId?: string): Promise<any>;
    /**
     * Registra um listener master para o barramento.
     * O Agent Dispatcher será o principal subscriber aqui.
     */
    subscribe(handler: (event: any) => Promise<void>): void;
}
//# sourceMappingURL=event-bus.d.ts.map