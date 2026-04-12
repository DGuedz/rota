import { IntentRepository } from './intent.repository';
import { RotaEventBus } from '../events/event-bus';
export declare class IntentService {
    private repository;
    private eventBus;
    constructor(repository: IntentRepository, eventBus: RotaEventBus);
    createIntent(payload: any): Promise<any>;
    getIntent(id: string): Promise<any>;
    listIntents(): Promise<any>;
}
//# sourceMappingURL=intent.service.d.ts.map