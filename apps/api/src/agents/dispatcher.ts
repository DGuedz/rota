import { RotaEventBus } from '../events/event-bus';
import { ExecutionLogService } from '../execution-logs/execution-log.service';
import { runRouter } from '@rota/agents/router-agent/run';
import { RotaEvent } from '@rota/shared-types';
import { WorkforceAgentKind, ExecutionStatus, EventSource } from '@prisma/client';

export class AgentDispatcher {
  constructor(
    private eventBus: RotaEventBus,
    private logService: ExecutionLogService
  ) {}

  /**
   * Conecta o Event Bus ao Workforce Agentic.
   * O Dispatcher ouve todos os eventos validados e os encaminha para o Router Agent.
   */
  start() {
    this.eventBus.subscribe(async (domainEvent) => {
      const startTime = Date.now();
      
      // 1. Converte o DomainEvent do Prisma para a interface abstrata dos Agentes (RotaEvent)
      const rotaEvent: RotaEvent = {
        eventId: domainEvent.eventId,
        source: domainEvent.source as any,
        type: domainEvent.type as any,
        payload: domainEvent.payload as any,
        timestamp: domainEvent.receivedAt.toISOString()
      };

      try {
        // 2. Chama o Router Agent (A porta de entrada do workforce)
        const result = await runRouter(rotaEvent);

        const latency = Date.now() - startTime;

        // 3. Grava o log de execução detalhado do Router Agent no Banco
        await this.logService.logExecution({
          agent: 'ROUTER' as WorkforceAgentKind,
          eventId: domainEvent.eventId,
          source: domainEvent.source as EventSource,
          eventType: domainEvent.type,
          status: result.dispatched ? ('DISPATCHED' as ExecutionStatus) : ('SKIPPED' as ExecutionStatus),
          decision: result.reason,
          input: { payload: domainEvent.payload },
          output: { targetAgent: result.targetAgent },
          latencyMs: latency,
        });

        // NOTA: Em um runtime completo, se targetAgent não for null, o Dispatcher
        // agora enviaria o evento para a fila específica do agente de destino
        // (ex: runDistributionAgent(rotaEvent) ou publicando no redis-queue desse agente).

      } catch (error: any) {
        const latency = Date.now() - startTime;

        await this.logService.logExecution({
          agent: 'ROUTER' as WorkforceAgentKind,
          eventId: domainEvent.eventId,
          source: domainEvent.source as EventSource,
          eventType: domainEvent.type,
          status: 'FAILED' as ExecutionStatus,
          error: { message: error.message, stack: error.stack },
          latencyMs: latency,
        });

        throw error; // Repassa para o EventBus marcar como FAILED
      }
    });

    console.log('[AgentDispatcher] Started and listening to Event Bus.');
  }
}
