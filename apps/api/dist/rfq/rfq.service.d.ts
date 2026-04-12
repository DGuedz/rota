import { RFQRepository } from './rfq.repository';
import { RotaEventBus } from '../events/event-bus';
export declare class RFQService {
    private repository;
    private eventBus;
    constructor(repository: RFQRepository, eventBus: RotaEventBus);
    openRFQ(intentId: string, buyerAgentId: string, payload?: any): Promise<any>;
    getRFQ(id: string): Promise<any>;
    awardRFQ(rfqId: string, bidId: string): Promise<any>;
    expireRFQ(rfqId: string): Promise<any>;
}
//# sourceMappingURL=rfq.service.d.ts.map