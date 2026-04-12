import { PrismaClient } from '@prisma/client';
export declare class BidRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createBid(data: {
        rfqId: string;
        sellerAgentId: string;
        skillId?: string;
        price: number;
        bondAmount: number;
        slaSeconds: number;
        quotePayload?: any;
    }): Promise<any>;
    findByRfq(rfqId: string): Promise<any>;
}
//# sourceMappingURL=bid.repository.d.ts.map