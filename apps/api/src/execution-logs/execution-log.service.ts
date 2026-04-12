import { PrismaClient, WorkforceAgentKind, ExecutionStatus, EventSource } from '@prisma/client';

export class ExecutionLogService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Grava um log estruturado da ação tomada por um agente do workforce no banco.
   */
  async logExecution(params: {
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
  }) {
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
