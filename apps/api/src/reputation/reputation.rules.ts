import { ReputationSourceType, Severity } from "@prisma/client";
import {
  REPUTATION_MAX_SCORE,
  REPUTATION_MIN_SCORE,
  ReputationRule,
  ReputationSignal,
} from "./reputation.types";

export const REPUTATION_RULES: Record<ReputationSignal, ReputationRule> = {
  ESCROW_SETTLED: {
    signal: "ESCROW_SETTLED",
    sourceType: ReputationSourceType.SETTLEMENT,
    delta: 10,
    severity: Severity.INFO,
    reason: "Escrow settled successfully",
  },
  PROOF_SUBMITTED: {
    signal: "PROOF_SUBMITTED",
    sourceType: ReputationSourceType.PROOF,
    delta: 3,
    severity: Severity.INFO,
    reason: "Proof submitted successfully",
  },
  SETTLEMENT_DISPUTE: {
    signal: "SETTLEMENT_DISPUTE",
    sourceType: ReputationSourceType.DISPUTE,
    delta: -20,
    severity: Severity.WARNING,
    reason: "Settlement entered dispute",
  },
  SLA_FAILED: {
    signal: "SLA_FAILED",
    sourceType: ReputationSourceType.SLA,
    delta: -15,
    severity: Severity.WARNING,
    reason: "SLA failed",
  },
  ESCROW_SLASHED: {
    signal: "ESCROW_SLASHED",
    sourceType: ReputationSourceType.SLASH,
    delta: -50,
    severity: Severity.CRITICAL,
    reason: "Escrow bond slashed",
  },
  MANUAL_ADJUSTMENT: {
    signal: "MANUAL_ADJUSTMENT",
    sourceType: ReputationSourceType.MANUAL,
    delta: 0,
    severity: Severity.INFO,
    reason: "Manual adjustment",
  },
};

export function clampReputationScore(score: number): number {
  return Math.max(REPUTATION_MIN_SCORE, Math.min(REPUTATION_MAX_SCORE, score));
}

export function getReputationRule(signal: ReputationSignal): ReputationRule {
  return REPUTATION_RULES[signal];
}
