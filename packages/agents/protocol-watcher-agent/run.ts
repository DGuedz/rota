import {
  protocolWatcherTriggers,
  ProtocolWatcherTrigger,
} from "./triggers";
import { validateProtocolWatcherAction } from "./policies";
import { classifyObservation, ClassifiedImpact } from "./watch.classifier";

export type ProtocolWatcherEvent = {
  eventId: string;
  source: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type ProtocolObservation = {
  source: string;
  topic: string;
  title: string;
  summary: string;
  recommendedAction: string;
  rawPayload: Record<string, unknown>;
};

export type ProtocolWatcherResult = {
  status: "COMPLETED" | "SKIPPED" | "FAILED";
  decision: string;
  observation?: ProtocolObservation;
  classifiedImpact?: ClassifiedImpact;
  notes?: string[];
};

function extractString(
  payload: Record<string, unknown>,
  keys: string[],
  fallback: string
): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
}

export async function runProtocolWatcherAgent(
  event: ProtocolWatcherEvent
): Promise<ProtocolWatcherResult> {
  const trigger = protocolWatcherTriggers[event.type as ProtocolWatcherTrigger];

  if (!trigger) {
    return {
      status: "SKIPPED",
      decision: "unsupported_event_for_protocol_watcher",
      notes: [`Event ${event.type} is not handled by protocol-watcher-agent`],
    };
  }

  const actionCheck = validateProtocolWatcherAction("observe_protocol_update");
  if (!actionCheck.allowed) {
    return {
      status: "FAILED",
      decision: actionCheck.reason,
      notes: ["Protocol watcher blocked by policy"],
    };
  }

  const title = extractString(
    event.payload,
    ["title", "headline", "name"],
    `${trigger.source} update detected`
  );

  const summary = extractString(
    event.payload,
    ["summary", "description", "body", "message"],
    trigger.description
  );

  const recommendedAction =
    trigger.source === "SECURITY"
      ? "open_internal_issue_and_review_immediately"
      : "review_and_classify_impact";

  const observation: ProtocolObservation = {
    source: trigger.source,
    topic: trigger.topic,
    title,
    summary,
    recommendedAction,
    rawPayload: event.payload,
  };

  const classifiedImpact = classifyObservation(observation);

  return {
    status: "COMPLETED",
    decision: "protocol_observation_created",
    observation,
    classifiedImpact,
    notes: [
      `Observation created for ${trigger.source}`,
      `Recommended action: ${recommendedAction}`,
      `Impact Area: ${classifiedImpact.area} | Urgency: ${classifiedImpact.urgency}`,
    ],
  };
}
