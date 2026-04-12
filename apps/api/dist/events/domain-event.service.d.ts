import { PrismaClient, EventSource, DomainEventStatus } from '@prisma/client';
export declare class DomainEventService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Persiste um evento no banco de dados com status inicial PENDING.
     * Retorna o eventId gerado para tracking.
     */
    createEvent(source: EventSource, type: string, payload: any, correlationId?: string, causationId?: string): Promise<any>;
    /**
     * Atualiza o status de um evento no banco (ex: PROCESSING, PROCESSED, FAILED).
     */
    updateStatus(eventId: string, status: DomainEventStatus, error?: string): Promise<any>;
}
//# sourceMappingURL=domain-event.service.d.ts.map