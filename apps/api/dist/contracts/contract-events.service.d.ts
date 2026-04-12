import { PrismaClient } from '@prisma/client';
import { RotaEventBus } from '../events/event-bus';
import { NormalizedDomainEvent } from './contract-events.types';
export declare class ContractEventsService {
    private prisma;
    private eventBus;
    constructor(prisma: PrismaClient, eventBus: RotaEventBus);
    /**
     * Processa o evento on-chain de forma idempotente.
     * Se o banco estiver desatualizado, ele força a conciliação (Soroban como fonte da verdade).
     */
    processEvent(event: NormalizedDomainEvent): Promise<void>;
    /**
     * Helper simplificado de estado para evitar re-processamento do mesmo evento Soroban.
     * Em produção, isso usaria uma máquina de estados finita (FSM).
     */
    private isAlreadyProcessed;
}
//# sourceMappingURL=contract-events.service.d.ts.map