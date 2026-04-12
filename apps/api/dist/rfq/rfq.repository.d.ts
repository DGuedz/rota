import { PrismaClient } from '@prisma/client';
export declare class RFQRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createRFQ(intentId: string, buyerAgentId: string, closesAt?: Date, payload?: any): Promise<any>;
    findById(id: string): Promise<any>;
    expireRFQ(id: string): Promise<any>;
    awardRFQ(rfqId: string, bidId: string): Promise<any>;
}
//# sourceMappingURL=rfq.repository.d.ts.map