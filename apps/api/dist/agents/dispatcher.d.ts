import { RotaEventBus } from '../events/event-bus';
import { ExecutionLogService } from '../execution-logs/execution-log.service';
import { PrismaClient } from '@prisma/client';
export declare class AgentDispatcher {
    private eventBus;
    private logService;
    private reputationService;
    constructor(eventBus: RotaEventBus, logService: ExecutionLogService, prisma: PrismaClient);
    /**
     * Conecta o Event Bus ao Workforce Agentic.
     * O Dispatcher ouve todos os eventos validados e os encaminha para o Router Agent.
     */
    start(): void;
}
//# sourceMappingURL=dispatcher.d.ts.map