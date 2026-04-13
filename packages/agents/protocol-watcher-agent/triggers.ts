export type ProtocolWatcherTrigger =
  | "protocol.stellar_update"
  | "protocol.soroban_update"
  | "protocol.x402_update"
  | "protocol.mpp_update"
  | "protocol.a2a_update"
  | "protocol.mcp_update"
  | "protocol.security_alert";

export type ProtocolWatchSource =
  | "STELLAR"
  | "SOROBAN"
  | "X402"
  | "MPP"
  | "A2A"
  | "MCP"
  | "SECURITY";

export const protocolWatcherTriggers: Record<
  ProtocolWatcherTrigger,
  {
    source: ProtocolWatchSource;
    topic: string;
    description: string;
  }
> = {
  "protocol.stellar_update": {
    source: "STELLAR",
    topic: "network",
    description: "Observe changes related to Stellar network behavior, docs or releases",
  },
  "protocol.soroban_update": {
    source: "SOROBAN",
    topic: "contracts",
    description: "Observe changes related to Soroban smart contracts and execution model",
  },
  "protocol.x402_update": {
    source: "X402",
    topic: "payments",
    description: "Observe changes related to x402 payment flows and request-based monetization",
  },
  "protocol.mpp_update": {
    source: "MPP",
    topic: "payments",
    description: "Observe changes related to MPP machine-to-machine payment flows",
  },
  "protocol.a2a_update": {
    source: "A2A",
    topic: "agent-interoperability",
    description: "Observe changes related to agent-to-agent communication and interoperability",
  },
  "protocol.mcp_update": {
    source: "MCP",
    topic: "tooling",
    description: "Observe changes related to model context/tool interface behavior",
  },
  "protocol.security_alert": {
    source: "SECURITY",
    topic: "risk",
    description: "Observe security incidents, breaking changes or trust-critical warnings",
  },
};
