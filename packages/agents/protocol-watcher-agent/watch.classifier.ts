import { ProtocolObservation } from "./run";

export type WatchImpactArea = "DOCS" | "BACKEND" | "CONTRACTS" | "PAYMENTS" | "GTM";
export type WatchUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ClassifiedImpact = {
  area: WatchImpactArea;
  urgency: WatchUrgency;
  action: string;
};

export function classifyObservation(observation: ProtocolObservation): ClassifiedImpact {
  if (observation.source === "SECURITY") {
    return {
      area: "BACKEND",
      urgency: "CRITICAL",
      action: "create_security_incident_and_halt_if_needed",
    };
  }

  if (observation.source === "SOROBAN") {
    return {
      area: "CONTRACTS",
      urgency: "HIGH",
      action: "review_smart_contracts_for_breaking_changes",
    };
  }

  if (observation.source === "X402" || observation.source === "MPP") {
    return {
      area: "PAYMENTS",
      urgency: "HIGH",
      action: "update_payment_middleware_and_policy",
    };
  }

  if (observation.source === "STELLAR") {
    return {
      area: "BACKEND",
      urgency: "MEDIUM",
      action: "verify_stellar_sdk_compatibility_and_update_xdr_builder",
    };
  }

  if (observation.source === "A2A" || observation.source === "MCP") {
    return {
      area: "GTM",
      urgency: "LOW",
      action: "update_docs_and_agent_interoperability_guidelines",
    };
  }

  return {
    area: "DOCS",
    urgency: "LOW",
    action: "log_and_update_general_documentation",
  };
}
