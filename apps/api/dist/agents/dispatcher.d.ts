import { RotaEventBus } from '../events/event-bus';
import { ExecutionLogService } from '../execution-logs/execution-log.service';
export declare class AgentDispatcher {
    private eventBus;
    private logService;
    constructor(eventBus: RotaEventBus, logService: ExecutionLogService);
    /**
     * Conecta o Event Bus ao Workforce Agentic.
     * O Dispatcher ouve todos os eventos validados e os encaminha para o Router Agent.
     */
    start(): void;
}
//# sourceMappingURL=dispatcher.d.ts.map