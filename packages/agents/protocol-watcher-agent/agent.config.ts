export const protocolWatcherAgentConfig = {
  id: "protocol-watcher-agent",
  name: "Protocol Watcher Agent",
  mission:
    "Observe external protocol and ecosystem changes relevant to ROTA and convert them into structured internal observations.",
  autonomyLevel: 1,
  allowedActions: [
    "observe_protocol_update",
    "normalize_observation",
    "generate_watch_report",
    "classify_initial_impact",
  ],
  forbiddenActions: [
    "modify_smart_contracts",
    "change_protocol_logic",
    "change_pricing",
    "publish_external_content",
    "merge_pull_requests",
    "execute_financial_actions",
  ],
  ownedPaths: [
    "docs/protocol/",
    "docs/payments/",
    "docs/backend/",
  ],
};
