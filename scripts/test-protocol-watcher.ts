import { PrismaClient } from "@prisma/client";
import { runProtocolWatcherAgent, ProtocolWatcherEvent } from "../packages/agents/protocol-watcher-agent/run";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Protocol Watcher E2E Test ===\n");

  const events: ProtocolWatcherEvent[] = [
    {
      eventId: "evt_stellar_update_1",
      source: "STELLAR",
      type: "protocol.stellar_update",
      timestamp: new Date().toISOString(),
      payload: {
        title: "Protocol 21 Upgrade Scheduled",
        summary: "Stellar validators will vote on Protocol 21 which introduces new features for smart contracts.",
        link: "https://stellar.org/blog/protocol-21",
      },
    },
    {
      eventId: "evt_soroban_update_1",
      source: "SOROBAN",
      type: "protocol.soroban_update",
      timestamp: new Date().toISOString(),
      payload: {
        headline: "Soroban CLI v22 Released",
        message: "New WASM limits and enhanced XDR generation logic.",
      },
    },
    {
      eventId: "evt_security_1",
      source: "SECURITY",
      type: "protocol.security_alert",
      timestamp: new Date().toISOString(),
      payload: {
        name: "Critical Vulnerability in Escrow Contracts",
        description: "A vulnerability was found in the rust standard library affecting time locks.",
        severity: "CRITICAL",
      },
    },
    {
      eventId: "evt_a2a_1",
      source: "A2A",
      type: "protocol.a2a_update",
      timestamp: new Date().toISOString(),
      payload: {
        title: "Agent Interoperability standard draft 2",
        body: "New fields added to the capability manifest for AI agents.",
      },
    },
  ];

  for (const event of events) {
    console.log(`\n--- Simulating Event: ${event.type} ---`);
    console.log(`Payload:`, event.payload);

    const result = await runProtocolWatcherAgent(event);

    console.log("Agent Status:", result.status);
    console.log("Agent Decision:", result.decision);

    if (result.observation) {
      console.log("\n[Observation Generated]");
      console.log("  Topic:", result.observation.topic);
      console.log("  Title:", result.observation.title);
      console.log("  Summary:", result.observation.summary);
      console.log("  Recommended Action:", result.observation.recommendedAction);
    }

    if (result.classifiedImpact) {
      console.log("\n[Impact Classified]");
      console.log(`  Area: ${result.classifiedImpact.area}`);
      console.log(`  Urgency: ${result.classifiedImpact.urgency}`);
      console.log(`  System Action: ${result.classifiedImpact.action}`);
    }

    if (result.notes && result.notes.length > 0) {
      console.log("\n[Agent Notes]");
      result.notes.forEach(note => console.log(`  - ${note}`));
    }
    
    console.log("-----------------------------------------");
  }

  console.log("\n=== Test Completed Successfully ===");
}

main()
  .catch((error) => {
    console.error("test-protocol-watcher failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
