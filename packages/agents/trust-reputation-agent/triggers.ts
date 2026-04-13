import { ReputationSignal } from "../../../apps/api/src/reputation/reputation.types";

export type TrustReputationTrigger =
  | "escrow.settled"
  | "escrow.slashed"
  | "proof.submitted"
  | "settlement.dispute"
  | "sla.failed";

export const trustReputationTriggers: Record<
  TrustReputationTrigger,
  {
    signal: ReputationSignal;
    description: string;
  }
> = {
  "escrow.settled": {
    signal: "ESCROW_SETTLED",
    description: "Successful settlement should reward the provider",
  },
  "escrow.slashed": {
    signal: "ESCROW_SLASHED",
    description: "Slashed escrow should heavily penalize the provider",
  },
  "proof.submitted": {
    signal: "PROOF_SUBMITTED",
    description: "Proof submission gives a small positive signal",
  },
  "settlement.dispute": {
    signal: "SETTLEMENT_DISPUTE",
    description: "Dispute should reduce trust score",
  },
  "sla.failed": {
    signal: "SLA_FAILED",
    description: "SLA failure should penalize the provider",
  },
};
