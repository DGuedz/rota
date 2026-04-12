import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { ReputationService } from "./reputation.service";

type ReputationRoutesDeps = {
  prisma: PrismaClient;
};

export async function registerReputationRoutes(
  fastify: FastifyInstance,
  deps: ReputationRoutesDeps
) {
  const reputationService = new ReputationService(deps.prisma);

  fastify.get("/reputation/agents/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const snapshot = await reputationService.getSnapshot(id);
      return reply.send(snapshot);
    } catch (error) {
      return reply.status(404).send({
        error: "agent_not_found",
        message: error instanceof Error ? error.message : "Agent not found",
      });
    }
  });

  fastify.get("/reputation/agents/:id/events", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { limit } = request.query as { limit?: string };

    try {
      const events = await reputationService.getEvents(
        id,
        limit ? Number(limit) : 50
      );

      return reply.send({
        agentId: id,
        count: events.length,
        events,
      });
    } catch (error) {
      return reply.status(500).send({
        error: "reputation_events_fetch_failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch reputation events",
      });
    }
  });

  fastify.get("/reputation/ranking", async (request, reply) => {
    const { limit } = request.query as { limit?: string };

    try {
      const ranking = await reputationService.getRanking(
        limit ? Number(limit) : 20
      );

      return reply.send({
        count: ranking.length,
        ranking,
      });
    } catch (error) {
      return reply.status(500).send({
        error: "reputation_ranking_failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch ranking",
      });
    }
  });
}
