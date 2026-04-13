import { PrismaClient, Severity } from "@prisma/client";
import {
  ApplyReputationSignalInput,
  ApplyReputationSignalResult,
  ReputationRankingItem,
  ReputationSnapshot,
} from "./reputation.types";
import { clampReputationScore, getReputationRule } from "./reputation.rules";

export class ReputationService {
  constructor(private readonly prisma: PrismaClient) {}

  async applySignal(
    input: ApplyReputationSignalInput
  ): Promise<ApplyReputationSignalResult> {
    const rule = getReputationRule(input.signal);

    const agent = await this.prisma.agent.findUnique({
      where: { id: input.agentId },
    });

    if (!agent) {
      throw new Error(`Agent not found: ${input.agentId}`);
    }

    const appliedDelta =
      input.signal === "MANUAL_ADJUSTMENT"
        ? input.manualDelta ?? 0
        : rule.delta;

    const reason =
      input.signal === "MANUAL_ADJUSTMENT"
        ? input.manualReason ?? "Manual adjustment"
        : rule.reason;

    const previousScore = agent.reputationScore;
    const newScore = clampReputationScore(previousScore + appliedDelta);

    const counters = this.computeCounterUpdates(input.signal);

    await this.prisma.$transaction([
      this.prisma.agent.update({
        where: { id: input.agentId },
        data: {
          reputationScore: newScore,
          totalExecutions:
            counters.totalExecutions !== 0
              ? { increment: counters.totalExecutions }
              : undefined,
          totalSuccesses:
            counters.totalSuccesses !== 0
              ? { increment: counters.totalSuccesses }
              : undefined,
          totalDisputes:
            counters.totalDisputes !== 0
              ? { increment: counters.totalDisputes }
              : undefined,
          totalStrikes:
            counters.totalStrikes !== 0
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
            ? Severity.INFO
            : rule.severity,
          reason,
          evidence: (input.evidence as any) ?? undefined,
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
      severity:
        input.signal === "MANUAL_ADJUSTMENT"
          ? Severity.INFO
          : rule.severity,
      sourceType: rule.sourceType,
    };
  }

  async getSnapshot(agentId: string): Promise<ReputationSnapshot> {
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

  async getEvents(agentId: string, limit = 50) {
    return this.prisma.reputationEvent.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getRanking(limit = 20): Promise<ReputationRankingItem[]> {
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

  private computeCounterUpdates(signal: ApplyReputationSignalInput["signal"]) {
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
