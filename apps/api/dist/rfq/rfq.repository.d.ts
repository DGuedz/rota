import { PrismaClient } from '@prisma/client';
export declare class RFQRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createRFQ(intentId: string, buyerAgentId: string, closesAt?: Date, payload?: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RFQStatus;
        intentId: string;
        buyerAgentId: string;
        createdAt: Date;
        updatedAt: Date;
        broadcastPayload: import("@prisma/client/runtime/library").JsonValue | null;
        openedAt: Date;
        closesAt: Date | null;
        awardedBidId: string | null;
    }>;
    findById(id: string): Promise<({
        intent: {
            id: string;
            status: import(".prisma/client").$Enums.IntentStatus;
            buyerAgentId: string;
            createdAt: Date;
            updatedAt: Date;
            skillId: string | null;
            title: string;
            description: string | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            preferredAssetCode: string;
            preferredAssetIssuer: string | null;
            requiredBond: import("@prisma/client/runtime/library").Decimal | null;
            minReputation: number;
            deadlineAt: Date | null;
            validationCriteria: import("@prisma/client/runtime/library").JsonValue | null;
            selectedBidId: string | null;
        };
        bids: {
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
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RFQStatus;
        intentId: string;
        buyerAgentId: string;
        createdAt: Date;
        updatedAt: Date;
        broadcastPayload: import("@prisma/client/runtime/library").JsonValue | null;
        openedAt: Date;
        closesAt: Date | null;
        awardedBidId: string | null;
    }) | null>;
    expireRFQ(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RFQStatus;
        intentId: string;
        buyerAgentId: string;
        createdAt: Date;
        updatedAt: Date;
        broadcastPayload: import("@prisma/client/runtime/library").JsonValue | null;
        openedAt: Date;
        closesAt: Date | null;
        awardedBidId: string | null;
    }>;
    awardRFQ(rfqId: string, bidId: string): Promise<{
        intent: {
            id: string;
            status: import(".prisma/client").$Enums.IntentStatus;
            buyerAgentId: string;
            createdAt: Date;
            updatedAt: Date;
            skillId: string | null;
            title: string;
            description: string | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            preferredAssetCode: string;
            preferredAssetIssuer: string | null;
            requiredBond: import("@prisma/client/runtime/library").Decimal | null;
            minReputation: number;
            deadlineAt: Date | null;
            validationCriteria: import("@prisma/client/runtime/library").JsonValue | null;
            selectedBidId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RFQStatus;
        intentId: string;
        buyerAgentId: string;
        createdAt: Date;
        updatedAt: Date;
        broadcastPayload: import("@prisma/client/runtime/library").JsonValue | null;
        openedAt: Date;
        closesAt: Date | null;
        awardedBidId: string | null;
    }>;
}
//# sourceMappingURL=rfq.repository.d.ts.map