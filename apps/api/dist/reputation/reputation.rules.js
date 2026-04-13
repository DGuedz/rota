"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPUTATION_RULES = void 0;
exports.clampReputationScore = clampReputationScore;
exports.getReputationRule = getReputationRule;
const client_1 = require("@prisma/client");
const reputation_types_1 = require("./reputation.types");
exports.REPUTATION_RULES = {
    ESCROW_SETTLED: {
        signal: "ESCROW_SETTLED",
        sourceType: client_1.ReputationSourceType.SETTLEMENT,
        delta: 10,
        severity: client_1.Severity.INFO,
        reason: "Escrow settled successfully",
    },
    PROOF_SUBMITTED: {
        signal: "PROOF_SUBMITTED",
        sourceType: client_1.ReputationSourceType.PROOF,
        delta: 3,
        severity: client_1.Severity.INFO,
        reason: "Proof submitted successfully",
    },
    SETTLEMENT_DISPUTE: {
        signal: "SETTLEMENT_DISPUTE",
        sourceType: client_1.ReputationSourceType.DISPUTE,
        delta: -20,
        severity: client_1.Severity.WARNING,
        reason: "Settlement entered dispute",
    },
    SLA_FAILED: {
        signal: "SLA_FAILED",
        sourceType: client_1.ReputationSourceType.SLA,
        delta: -15,
        severity: client_1.Severity.WARNING,
        reason: "SLA failed",
    },
    ESCROW_SLASHED: {
        signal: "ESCROW_SLASHED",
        sourceType: client_1.ReputationSourceType.SLASH,
        delta: -50,
        severity: client_1.Severity.CRITICAL,
        reason: "Escrow bond slashed",
    },
    MANUAL_ADJUSTMENT: {
        signal: "MANUAL_ADJUSTMENT",
        sourceType: client_1.ReputationSourceType.MANUAL,
        delta: 0,
        severity: client_1.Severity.INFO,
        reason: "Manual adjustment",
    },
};
function clampReputationScore(score) {
    return Math.max(reputation_types_1.REPUTATION_MIN_SCORE, Math.min(reputation_types_1.REPUTATION_MAX_SCORE, score));
}
function getReputationRule(signal) {
    return exports.REPUTATION_RULES[signal];
}
//# sourceMappingURL=reputation.rules.js.map