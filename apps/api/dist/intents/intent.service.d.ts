import { IntentRepository } from './intent.repository';
import { RotaEventBus } from '../events/event-bus';
export declare class IntentService {
    private repository;
    private eventBus;
    constructor(repository: IntentRepository, eventBus: RotaEventBus);
    createIntent(payload: any): Promise<{
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
    }>;
    getIntent(id: string): Promise<({
        buyerAgent: {
            id: string;
            status: import(".prisma/client").$Enums.AgentStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            walletAddress: string;
            displayName: string | null;
            reputationScore: number;
            totalExecutions: number;
            totalSuccesses: number;
            totalDisputes: number;
            totalStrikes: number;
        };
        skill: {
            id: string;
            name: string;
            isActive: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            slaSeconds: number;
            description: string;
            requiredBond: import("@prisma/client/runtime/library").Decimal;
            agentId: string;
            slug: string;
            category: string;
            endpointUrl: string | null;
            priceMode: import(".prisma/client").$Enums.PriceMode;
            priceConfig: import("@prisma/client/runtime/library").JsonValue;
            reputationThreshold: number;
        } | null;
        rfq: {
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
        } | null;
    } & {
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
    }) | null>;
    listIntents(): Promise<{
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
    }[]>;
}
//# sourceMappingURL=intent.service.d.ts.map