import { ReputationSignal } from "../../../apps/api/src/reputation/reputation.types";
import {
  trustReputationTriggers,
  TrustReputationTrigger,
} from "./triggers";

export type TrustRotaEvent = {
  eventId: string;
  source: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type TrustAgentResult = {
  status: "COMPLETED" | "SKIPPED" | "FAILED";
  decision: string;
  signal?: ReputationSignal;
  targetAgentId?: string;
  sourceId?: string;
  evidence?: Record<string, unknown>;
  notes?: string[];
};

function resolveTargetAgentId(payload: Record<string, unknown>): string | undefined {
  const candidate =
    payload.sellerAgentId ??
    payload.providerAgentId ??
    payload.agentId ??
    payload.targetAgentId;

  return typeof candidate === "string" ? candidate : undefined;
}

function resolveSourceId(
  eventId: string,
  payload: Record<string, unknown>
): string {
  const sourceId =
    payload.escrowId ??
    payload.transactionId ??
    payload.proofId ??
    payload.settlementId ??
    eventId;

  return String(sourceId);
}

export async function runTrustReputationAgent(
  event: TrustRotaEvent
): Promise<TrustAgentResult> {
  const trigger = trustReputationTriggers[event.type as TrustReputationTrigger];

  if (!trigger) {
    return {
      status: "SKIPPED",
      decision: "unsupported_event_for_trust_agent",
      notes: [`Event ${event.type} is not handled by trust-reputation-agent`],
    };
  }

  const targetAgentId = resolveTargetAgentId(event.payload);
  if (!targetAgentId) {
    return {
      status: "FAILED",
      decision: "missing_target_agent_id",
      notes: ["No seller/provider/agent id found in payload"],
    };
  }

  return {
    status: "COMPLETED",
    decision: "apply_reputation_signal",
    signal: trigger.signal,
    targetAgentId,
    sourceId: resolveSourceId(event.eventId, event.payload),
    evidence: {
      eventType: event.type,
      source: event.source,
      timestamp: event.timestamp,
      payload: event.payload,
    },
    notes: [trigger.description],
  };
}
