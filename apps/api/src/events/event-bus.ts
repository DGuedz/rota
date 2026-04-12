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
      // 1. Grava no banco (ou mock)
      const domainEvent = await this.eventService.createEvent(
        source,
        type,
        payload,
        correlationId,
        causationId
      );

      // Mapeia para RotaEvent format se necessário (Dispatcher espera RotaEvent.id e etc)
      const mappedEvent = {
        id: domainEvent.eventId,
        type: domainEvent.type,
        source: domainEvent.source,
        payload: domainEvent.payload,
        timestamp: new Date().toISOString()
      };

      // 2. Emite internamente (Fire and forget na perspectiva do emissor)
      this.emitter.emit('rota_event', mappedEvent);
      
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
        if (domainEvent.id) { // Fix mapped event
          try {
            await this.eventService.updateStatus(domainEvent.id, 'PROCESSING' as DomainEventStatus);
          } catch (e) {
            // Ignore if DB is not available for this update in test mode
          }
        }
        await handler(domainEvent);
        if (domainEvent.id) {
          try {
            await this.eventService.updateStatus(domainEvent.id, 'PROCESSED' as DomainEventStatus);
          } catch (e) {
            // Ignore if DB is not available for this update in test mode
          }
        }
      } catch (error: any) {
        console.error(`[EventBus] Error handling event ${domainEvent.id}:`, error.message);
        if (domainEvent.id) {
          try {
            await this.eventService.updateStatus(domainEvent.id, 'FAILED' as DomainEventStatus, error.message);
          } catch (e) {
            // Ignore
          }
        }
      }
    });
  }
}
