import { PrismaClient, EventSource, DomainEventStatus } from '@prisma/client';
export declare class DomainEventService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Persiste um evento no banco de dados com status inicial PENDING.
     * Retorna o eventId gerado para tracking.
     */
    createEvent(source: EventSource, type: string, payload: any, correlationId?: string, causationId?: string): Promise<{
        id: string;
        eventId: string;
        source: import(".prisma/client").$Enums.EventSource;
        type: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.DomainEventStatus;
        correlationId: string | null;
        causationId: string | null;
        retryCount: number;
        lastError: string | null;
        receivedAt: Date;
        processedAt: Date | null;
    }>;
    /**
     * Atualiza o status de um evento no banco (ex: PROCESSING, PROCESSED, FAILED).
     */
    updateStatus(eventId: string, status: DomainEventStatus, error?: string): Promise<{
        id: string;
        eventId: string;
        source: import(".prisma/client").$Enums.EventSource;
        type: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.DomainEventStatus;
        correlationId: string | null;
        causationId: string | null;
        retryCount: number;
        lastError: string | null;
        receivedAt: Date;
        processedAt: Date | null;
    }>;
}
//# sourceMappingURL=domain-event.service.d.ts.map