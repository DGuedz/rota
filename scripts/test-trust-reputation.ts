import { PrismaClient } from "@prisma/client";
import { ReputationService } from "../apps/api/src/reputation/reputation.service";
import { runTrustReputationAgent } from "../packages/agents/trust-reputation-agent/run";

// Emular a carga do dotenv se a url nao estiver setada
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../apps/api/.env") });

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "postgresql://rota_user:rota_password@localhost:5432/rota_db?schema=public",
});

async function ensureTestAgent() {
  const address = "GTESTTRUSTAGENT000000000000000000000000000000000";

  let agent = await prisma.agent.findFirst({
    where: { address },
  });

  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        address,
        name: "Trust Test Agent",
      },
    });
  }

  return agent;
}

async function main() {
  const reputationService = new ReputationService(prisma);
  const agent = await ensureTestAgent();

  console.log("Agent created/found:", agent.id);

  const events = [
    {
      eventId: "evt_settled_1",
      source: "PROTOCOL",
      type: "escrow.settled",
      timestamp: new Date().toISOString(),
      payload: {
        escrowId: "escrow_1",
        sellerAgentId: agent.id,
        amountPaid: "0.01",
      },
    },
    {
      eventId: "evt_proof_1",
      source: "PROTOCOL",
      type: "proof.submitted",
      timestamp: new Date().toISOString(),
      payload: {
        proofId: "proof_1",
        sellerAgentId: agent.id,
      },
    },
    {
      eventId: "evt_dispute_1",
      source: "PROTOCOL",
      type: "settlement.dispute",
      timestamp: new Date().toISOString(),
      payload: {
        settlementId: "settlement_1",
        sellerAgentId: agent.id,
      },
    },
    {
      eventId: "evt_slash_1",
      source: "PROTOCOL",
      type: "escrow.slashed",
      timestamp: new Date().toISOString(),
      payload: {
        escrowId: "escrow_2",
        sellerAgentId: agent.id,
      },
    },
  ];

  const before = await reputationService.getSnapshot(agent.id);
  console.log("\n[BEFORE] Snapshot:", before);

  for (const event of events) {
    console.log(`\n--- Processando Evento: ${event.type} ---`);
    const trustResult = await runTrustReputationAgent(event);

    console.log("Agent Result Decision:", trustResult.decision);

    if (
      trustResult.status === "COMPLETED" &&
      trustResult.signal &&
      trustResult.targetAgentId &&
      trustResult.sourceId
    ) {
      const applied = await reputationService.applySignal({
        agentId: trustResult.targetAgentId,
        signal: trustResult.signal,
        sourceId: trustResult.sourceId,
        evidence: trustResult.evidence ?? null,
      });

      console.log(`Signal Applied: ${applied.signal} | Delta: ${applied.appliedDelta} | Novo Score: ${applied.newScore}`);
    }
  }

  const after = await reputationService.getSnapshot(agent.id);
  const history = await reputationService.getEvents(agent.id, 20);

  console.log("\n=============================================");
  console.log("[AFTER] Snapshot Final:", after);
  console.log("Total Histórico de Eventos Gravados:", history.length);
  console.log(
    history.map((e: any) => ({
      sourceType: e.sourceType,
      delta: e.delta,
      reason: e.reason,
      newScore: e.newScore,
    }))
  );
  console.log("=============================================\n");
}

main()
  .catch((error) => {
    console.error("test-trust-reputation failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
