"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerReputationRoutes = registerReputationRoutes;
const reputation_service_1 = require("./reputation.service");
async function registerReputationRoutes(fastify, deps) {
    const reputationService = new reputation_service_1.ReputationService(deps.prisma);
    fastify.get("/reputation/agents/:id", async (request, reply) => {
        const { id } = request.params;
        try {
            const snapshot = await reputationService.getSnapshot(id);
            return reply.send(snapshot);
        }
        catch (error) {
            return reply.status(404).send({
                error: "agent_not_found",
                message: error instanceof Error ? error.message : "Agent not found",
            });
        }
    });
    fastify.get("/reputation/agents/:id/events", async (request, reply) => {
        const { id } = request.params;
        const { limit } = request.query;
        try {
            const events = await reputationService.getEvents(id, limit ? Number(limit) : 50);
            return reply.send({
                agentId: id,
                count: events.length,
                events,
            });
        }
        catch (error) {
            return reply.status(500).send({
                error: "reputation_events_fetch_failed",
                message: error instanceof Error
                    ? error.message
                    : "Failed to fetch reputation events",
            });
        }
    });
    fastify.get("/reputation/ranking", async (request, reply) => {
        const { limit } = request.query;
        try {
            const ranking = await reputationService.getRanking(limit ? Number(limit) : 20);
            return reply.send({
                count: ranking.length,
                ranking,
            });
        }
        catch (error) {
            return reply.status(500).send({
                error: "reputation_ranking_failed",
                message: error instanceof Error
                    ? error.message
                    : "Failed to fetch ranking",
            });
        }
    });
}
//# sourceMappingURL=reputation.routes.js.map