import { PrismaClient, WorkforceAgentKind, ExecutionStatus, EventSource } from '@prisma/client';
export declare class ExecutionLogService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Grava um log estruturado da ação tomada por um agente do workforce no banco.
     */
    logExecution(params: {
        agent: WorkforceAgentKind;
        eventId: string;
        source: EventSource;
        eventType: string;
        status: ExecutionStatus;
        decision?: string;
        input?: any;
        output?: any;
        error?: any;
        latencyMs?: number;
    }): Promise<any>;
}
//# sourceMappingURL=execution-log.service.d.ts.map