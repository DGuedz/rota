import { RotaEvent, resolveTrigger } from './triggers';
import { routerPolicies } from './policies';

export interface RouteResult {
  eventId: string;
  source: string;
  targetAgent: string | null;
  reason: string;
  dispatched: boolean;
}

/**
 * Ponto de entrada do Router Agent.
 * Recebe o evento bruto, avalia as políticas, descobre o agente de destino e efetua o dispatch.
 */
export async function runRouter(event: RotaEvent): Promise<RouteResult> {
  console.log(`[ROTA Router] Received event: [${event.source}] ${event.type}`);

  try {
    // 1. Validar Policy: Intervenção Humana
    if (routerPolicies.requiresHumanApproval(event)) {
      console.log(`[ROTA Router] Event ${event.eventId} halted: Requires human approval.`);
      return {
        eventId: event.eventId,
        source: event.source,
        targetAgent: null,
        reason: 'Requires human approval based on policy.',
        dispatched: false
      };
    }

    // 2. Classificar Intenção e Encontrar o Agente Destino (Trigger Resolution)
    const trigger = resolveTrigger(event);
    
    if (!trigger) {
      console.warn(`[ROTA Router] Unknown event type: ${event.type}. Discarding.`);
      return {
        eventId: event.eventId,
        source: event.source,
        targetAgent: null,
        reason: `Unknown event type or source. Discarded based on error handling policy: ${routerPolicies.errorHandling.onUnknownEvent}.`,
        dispatched: false
      };
    }

    // 3. Checar Guardrails de Execução
    routerPolicies.enforceGuardrails('dispatch_to_agent');

    // 4. Dispatch (Simulado para esta etapa de arquitetura)
    // TODO: Implementar a publicação na fila do Redis para o agente destino consumir
    const targetAgent = trigger.targetAgent;
    console.log(`[ROTA Router] 🚀 Event ${event.eventId} routed to => ${targetAgent}`);

    // 5. Retornar log estruturado
    return {
      eventId: event.eventId,
      source: event.source,
      targetAgent: targetAgent,
      reason: 'Matched supported trigger successfully.',
      dispatched: true
    };
  } catch (error: any) {
    console.error(`[ROTA Router] Execution Error for event ${event.eventId}:`, error.message);
    return {
      eventId: event.eventId,
      source: event.source,
      targetAgent: null,
      reason: `Execution Error: ${error.message}`,
      dispatched: false
    };
  }
}
