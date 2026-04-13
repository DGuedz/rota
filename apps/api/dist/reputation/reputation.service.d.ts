import { PrismaClient } from "@prisma/client";
import { ApplyReputationSignalInput, ApplyReputationSignalResult, ReputationRankingItem, ReputationSnapshot } from "./reputation.types";
export declare class ReputationService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    applySignal(input: ApplyReputationSignalInput): Promise<ApplyReputationSignalResult>;
    getSnapshot(agentId: string): Promise<ReputationSnapshot>;
    getEvents(agentId: string, limit?: number): Promise<{
        id: string;
        reason: string;
        createdAt: Date;
        agentId: string;
        sourceType: import(".prisma/client").$Enums.ReputationSourceType;
        sourceId: string;
        delta: number;
        severity: import(".prisma/client").$Enums.Severity;
        evidence: import("@prisma/client/runtime/library").JsonValue | null;
        previousScore: number;
        newScore: number;
    }[]>;
    getRanking(limit?: number): Promise<ReputationRankingItem[]>;
    private computeCounterUpdates;
}
//# sourceMappingURL=reputation.service.d.ts.map