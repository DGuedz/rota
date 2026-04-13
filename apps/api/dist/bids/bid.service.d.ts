import { BidRepository } from './bid.repository';
import { RotaEventBus } from '../events/event-bus';
export declare class BidService {
    private repository;
    private eventBus;
    constructor(repository: BidRepository, eventBus: RotaEventBus);
    submitBid(rfqId: string, sellerAgentId: string, payload: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BidStatus;
        sellerAgentId: string;
        bondAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        slaSeconds: number;
        quotePayload: import("@prisma/client/runtime/library").JsonValue | null;
        rfqId: string;
        skillId: string | null;
    }>;
    getBidsForRFQ(rfqId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BidStatus;
        sellerAgentId: string;
        bondAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        price: import("@prisma/client/runtime/library").Decimal;
        slaSeconds: number;
        quotePayload: import("@prisma/client/runtime/library").JsonValue | null;
        rfqId: string;
        skillId: string | null;
    }[]>;
}
//# sourceMappingURL=bid.service.d.ts.map