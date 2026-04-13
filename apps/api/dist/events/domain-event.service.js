"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
class DomainEventService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Persiste um evento no banco de dados com status inicial PENDING.
     * Retorna o eventId gerado para tracking.
     */
    async createEvent(source, type, payload, correlationId, causationId) {
        const eventId = `evt_${(0, crypto_1.randomUUID)()}`;
        const event = await this.prisma.domainEvent.create({
            data: {
                eventId,
                source,
                type,
                payload,
                status: client_1.DomainEventStatus.PENDING,
                correlationId,
                causationId,
            },
        });
        return event;
    }
    /**
     * Atualiza o status de um evento no banco (ex: PROCESSING, PROCESSED, FAILED).
     */
    async updateStatus(eventId, status, error) {
        return this.prisma.domainEvent.update({
            where: { eventId },
            data: {
                status,
                lastError: error,
                processedAt: status === client_1.DomainEventStatus.PROCESSED ? new Date() : undefined,
            },
        });
    }
}
exports.DomainEventService = DomainEventService;
//# sourceMappingURL=domain-event.service.js.map