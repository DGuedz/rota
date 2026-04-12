import { EventEmitter } from 'events';
import { DomainEventService } from './domain-event.service';
import { EventSource, DomainEventStatus } from '@prisma/client';

/**
 * Event Bus Interno da ROTA (Em Memória / DB Persisted)
 * Em um cenário de produção escalado, o EventEmitter pode ser trocado por Redis Pub/Sub ou SQS.
 * Atualmente atende à restrição "Pode usar EventEmitter ou fila simples baseada em Redis".
 */
export class RotaEventBus {
  private emitter = new EventEmitter();

  constructor(private eventService: DomainEventService) {}

  /**
   * Publica um evento no barramento.
   * Passo 1: Persiste no PostgreSQL como PENDING.
   * Passo 2: Dispara o evento via EventEmitter para os workers (Agentes).
   */
  async publish(
    source: EventSource,
    type: string,
    payload: Record<string, any>,
    correlationId?: string,
    causationId?: string
  ) {
    try {
      // 1. Grava no banco
      const domainEvent = await this.eventService.createEvent(
        source,
        type,
        payload,
        correlationId,
        causationId
      );

      // 2. Emite internamente (Fire and forget na perspectiva do emissor)
      this.emitter.emit('rota_event', domainEvent);
      
      return domainEvent.eventId;
    } catch (error) {
      console.error(`[EventBus] Failed to publish event: ${type}`, error);
      throw error;
    }
  }

  /**
   * Registra um listener master para o barramento.
   * O Agent Dispatcher será o principal subscriber aqui.
   */
  subscribe(handler: (event: any) => Promise<void>) {
    this.emitter.on('rota_event', async (domainEvent) => {
      try {
        await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSING' as DomainEventStatus);
        await handler(domainEvent);
        await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSED' as DomainEventStatus);
      } catch (error: any) {
        console.error(`[EventBus] Error handling event ${domainEvent.eventId}:`, error.message);
        await this.eventService.updateStatus(domainEvent.eventId, 'FAILED' as DomainEventStatus, error.message);
      }
    });
  }
}
