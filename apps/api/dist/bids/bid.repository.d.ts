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
    }): Promise<{
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
    findByRfq(rfqId: string): Promise<{
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
//# sourceMappingURL=bid.repository.d.ts.map