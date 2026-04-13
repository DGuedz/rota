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
    }): Promise<{
        error: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        eventId: string;
        source: import(".prisma/client").$Enums.EventSource;
        status: import(".prisma/client").$Enums.ExecutionStatus;
        output: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        workforceAgent: import(".prisma/client").$Enums.WorkforceAgentKind;
        eventType: string;
        decision: string | null;
        input: import("@prisma/client/runtime/library").JsonValue | null;
        latencyMs: number | null;
    }>;
}
//# sourceMappingURL=execution-log.service.d.ts.map