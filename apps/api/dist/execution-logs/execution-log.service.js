"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionLogService = void 0;
class ExecutionLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Grava um log estruturado da ação tomada por um agente do workforce no banco.
     */
    async logExecution(params) {
        return this.prisma.agentExecutionLog.create({
            data: {
                workforceAgent: params.agent,
                eventId: params.eventId,
                source: params.source,
                eventType: params.eventType,
                status: params.status,
                decision: params.decision,
                input: params.input || {},
                output: params.output || {},
                error: params.error || {},
                latencyMs: params.latencyMs,
            },
        });
    }
}
exports.ExecutionLogService = ExecutionLogService;
//# sourceMappingURL=execution-log.service.js.map