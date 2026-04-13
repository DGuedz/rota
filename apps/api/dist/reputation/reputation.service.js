"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const client_1 = require("@prisma/client");
const reputation_rules_1 = require("./reputation.rules");
class ReputationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async applySignal(input) {
        const rule = (0, reputation_rules_1.getReputationRule)(input.signal);
        const agent = await this.prisma.agent.findUnique({
            where: { id: input.agentId },
        });
        if (!agent) {
            throw new Error(`Agent not found: ${input.agentId}`);
        }
        const appliedDelta = input.signal === "MANUAL_ADJUSTMENT"
            ? input.manualDelta ?? 0
            : rule.delta;
        const reason = input.signal === "MANUAL_ADJUSTMENT"
            ? input.manualReason ?? "Manual adjustment"
            : rule.reason;
        const previousScore = agent.reputationScore;
        const newScore = (0, reputation_rules_1.clampReputationScore)(previousScore + appliedDelta);
        const counters = this.computeCounterUpdates(input.signal);
        await this.prisma.$transaction([
            this.prisma.agent.update({
                where: { id: input.agentId },
                data: {
                    reputationScore: newScore,
                    totalExecutions: counters.totalExecutions !== 0
                        ? { increment: counters.totalExecutions }
                        : undefined,
                    totalSuccesses: counters.totalSuccesses !== 0
                        ? { increment: counters.totalSuccesses }
                        : undefined,
                    totalDisputes: counters.totalDisputes !== 0
                        ? { increment: counters.totalDisputes }
                        : undefined,
                    totalStrikes: counters.totalStrikes !== 0
                        ? { increment: counters.totalStrikes }
                        : undefined,
                },
            }),
            this.prisma.reputationEvent.create({
                data: {
                    agentId: input.agentId,
                    sourceType: rule.sourceType,
                    sourceId: input.sourceId,
                    delta: appliedDelta,
                    severity: input.signal === "MANUAL_ADJUSTMENT"
                        ? client_1.Severity.INFO
                        : rule.severity,
                    reason,
                    evidence: input.evidence ?? undefined,
                    previousScore,
                    newScore,
                },
            }),
        ]);
        return {
            agentId: input.agentId,
            signal: input.signal,
            previousScore,
            newScore,
            appliedDelta,
            reason,
            severity: input.signal === "MANUAL_ADJUSTMENT"
                ? client_1.Severity.INFO
                : rule.severity,
            sourceType: rule.sourceType,
        };
    }
    async getSnapshot(agentId) {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
            select: {
                id: true,
                reputationScore: true,
                totalExecutions: true,
                totalSuccesses: true,
                totalDisputes: true,
                totalStrikes: true,
            },
        });
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        return {
            agentId: agent.id,
            reputationScore: agent.reputationScore,
            totalExecutions: agent.totalExecutions,
            totalSuccesses: agent.totalSuccesses,
            totalDisputes: agent.totalDisputes,
            totalStrikes: agent.totalStrikes,
        };
    }
    async getEvents(agentId, limit = 50) {
        return this.prisma.reputationEvent.findMany({
            where: { agentId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async getRanking(limit = 20) {
        const agents = await this.prisma.agent.findMany({
            where: { status: "ACTIVE" },
            orderBy: [
                { reputationScore: "desc" },
                { totalSuccesses: "desc" },
                { totalStrikes: "asc" },
            ],
            take: limit,
            select: {
                id: true,
                walletAddress: true,
                displayName: true,
                reputationScore: true,
                totalExecutions: true,
                totalSuccesses: true,
                totalDisputes: true,
                totalStrikes: true,
            },
        });
        return agents.map((agent) => ({
            agentId: agent.id,
            walletAddress: agent.walletAddress,
            displayName: agent.displayName,
            reputationScore: agent.reputationScore,
            totalExecutions: agent.totalExecutions,
            totalSuccesses: agent.totalSuccesses,
            totalDisputes: agent.totalDisputes,
            totalStrikes: agent.totalStrikes,
        }));
    }
    computeCounterUpdates(signal) {
        switch (signal) {
            case "ESCROW_SETTLED":
                return {
                    totalExecutions: 1,
                    totalSuccesses: 1,
                    totalDisputes: 0,
                    totalStrikes: 0,
                };
            case "SETTLEMENT_DISPUTE":
                return {
                    totalExecutions: 0,
                    totalSuccesses: 0,
                    totalDisputes: 1,
                    totalStrikes: 0,
                };
            case "SLA_FAILED":
                return {
                    totalExecutions: 0,
                    totalSuccesses: 0,
                    totalDisputes: 0,
                    totalStrikes: 1,
                };
            case "ESCROW_SLASHED":
                return {
                    totalExecutions: 0,
                    totalSuccesses: 0,
                    totalDisputes: 0,
                    totalStrikes: 1,
                };
            case "PROOF_SUBMITTED":
            case "MANUAL_ADJUSTMENT":
            default:
                return {
                    totalExecutions: 0,
                    totalSuccesses: 0,
                    totalDisputes: 0,
                    totalStrikes: 0,
                };
        }
    }
}
exports.ReputationService = ReputationService;
//# sourceMappingURL=reputation.service.js.map