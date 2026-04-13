import { protocolWatcherAgentConfig } from "./agent.config";

export function validateProtocolWatcherAction(action: string) {
  if (protocolWatcherAgentConfig.forbiddenActions.includes(action)) {
    return {
      allowed: false,
      reason: "forbidden_action",
    };
  }

  if (!protocolWatcherAgentConfig.allowedActions.includes(action)) {
    return {
      allowed: false,
      reason: "unknown_or_unapproved_action",
    };
  }

  return {
    allowed: true,
    reason: "ok",
  };
}

export function requiresHumanApproval(action: string): boolean {
  return [
    "publish_external_content",
    "change_protocol_logic",
    "modify_smart_contracts",
    "change_pricing",
  ].includes(action);
}

export function canWritePath(path: string): boolean {
  return protocolWatcherAgentConfig.ownedPaths.some((owned) =>
    path.startsWith(owned)
  );
}
