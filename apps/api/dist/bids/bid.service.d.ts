import { BidRepository } from './bid.repository';
import { RotaEventBus } from '../events/event-bus';
export declare class BidService {
    private repository;
    private eventBus;
    constructor(repository: BidRepository, eventBus: RotaEventBus);
    submitBid(rfqId: string, sellerAgentId: string, payload: any): Promise<any>;
    getBidsForRFQ(rfqId: string): Promise<any>;
}
//# sourceMappingURL=bid.service.d.ts.map