import { ReputationSourceType, Severity } from "@prisma/client";
export type ReputationSignal = "ESCROW_SETTLED" | "PROOF_SUBMITTED" | "SETTLEMENT_DISPUTE" | "SLA_FAILED" | "ESCROW_SLASHED" | "MANUAL_ADJUSTMENT";
export type ReputationRule = {
    signal: ReputationSignal;
    sourceType: ReputationSourceType;
    delta: number;
    severity: Severity;
    reason: string;
};
export type ApplyReputationSignalInput = {
    agentId: string;
    signal: ReputationSignal;
    sourceId: string;
    evidence?: Record<string, unknown> | null;
    manualDelta?: number;
    manualReason?: string;
};
export type ApplyReputationSignalResult = {
    agentId: string;
    signal: ReputationSignal;
    previousScore: number;
    newScore: number;
    appliedDelta: number;
    reason: string;
    severity: Severity;
    sourceType: ReputationSourceType;
};
export type ReputationSnapshot = {
    agentId: string;
    reputationScore: number;
    totalExecutions: number;
    totalSuccesses: number;
    totalDisputes: number;
    totalStrikes: number;
};
export type ReputationRankingItem = {
    agentId: string;
    walletAddress: string;
    displayName: string | null;
    reputationScore: number;
    totalExecutions: number;
    totalSuccesses: number;
    totalDisputes: number;
    totalStrikes: number;
};
export declare const REPUTATION_MIN_SCORE = 0;
export declare const REPUTATION_MAX_SCORE = 1000;
//# sourceMappingURL=reputation.types.d.ts.map