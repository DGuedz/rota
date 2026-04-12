import { PrismaClient, EventSource, DomainEventStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export class DomainEventService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Persiste um evento no banco de dados com status inicial PENDING.
   * Retorna o eventId gerado para tracking.
   */
  async createEvent(
    source: EventSource,
    type: string,
    payload: any,
    correlationId?: string,
    causationId?: string
  ) {
    const eventId = `evt_${randomUUID()}`;
    const event = await this.prisma.domainEvent.create({
      data: {
        eventId,
        source,
        type,
        payload,
        status: DomainEventStatus.PENDING,
        correlationId,
        causationId,
      },
    });
    return event;
  }

  /**
   * Atualiza o status de um evento no banco (ex: PROCESSING, PROCESSED, FAILED).
   */
  async updateStatus(eventId: string, status: DomainEventStatus, error?: string) {
    return this.prisma.domainEvent.update({
      where: { eventId },
      data: {
        status,
        lastError: error,
        processedAt: status === DomainEventStatus.PROCESSED ? new Date() : undefined,
      },
    });
  }
}
