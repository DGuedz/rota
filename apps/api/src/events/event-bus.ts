import { DomainEventService } from './domain-event.service';
import { EventSource, DomainEventStatus } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Event Bus Interno da ROTA (BullMQ / Redis Persisted)
 * Substitui o EventEmitter em memória por uma fila resiliente.
 */
export class RotaEventBus {
  private queue: Queue;
  private worker?: Worker;

  constructor(private eventService: DomainEventService) {
    this.queue = new Queue('rota-events', { connection: redisConnection });
  }

  /**
   * Publica um evento no barramento.
   * Passo 1: Persiste no PostgreSQL como PENDING.
   * Passo 2: Adiciona na fila BullMQ para os workers (Agentes).
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
    } catch (error) {
      console.error(`[EventBus] Failed to publish event: ${type}`, error);
      throw error;
    }
  }

  /**
   * Registra um listener master para o barramento via BullMQ Worker.
   * O Agent Dispatcher será o principal subscriber aqui.
   */
  subscribe(handler: (event: any) => Promise<void>) {
    this.worker = new Worker('rota-events', async (job) => {
      const domainEvent = job.data;
      try {
        if (domainEvent.eventId) {
          try {
            await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSING' as DomainEventStatus);
          } catch (e) {
            // Ignore
          }
        }
        await handler(domainEvent);
        if (domainEvent.eventId) {
          try {
            await this.eventService.updateStatus(domainEvent.eventId, 'PROCESSED' as DomainEventStatus);
          } catch (e) {
            // Ignore
          }
        }
      } catch (error: any) {
        console.error(`[EventBus] Error handling event ${domainEvent.eventId}:`, error.message);
        if (domainEvent.eventId) {
          try {
            await this.eventService.updateStatus(domainEvent.eventId, 'FAILED' as DomainEventStatus, error.message);
          } catch (e) {
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

