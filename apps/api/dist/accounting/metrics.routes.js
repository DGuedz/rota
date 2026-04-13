"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRoutes = metricsRoutes;
async function metricsRoutes(fastify, options) {
    const { prisma } = options;
    /**
     * Endpoint de Telemetria Econômica: Retorna as métricas de uso e receita de uma Skill.
     */
    fastify.get('/skills/:skillId/metrics', async (request, reply) => {
        const { skillId } = request.params;
        // Nota: Em produção, agruparíamos isso por window (ex: soma do mês atual)
        // Para simplificar a POC, buscamos as agregações totais já acumuladas.
        const metrics = await prisma.skillUsageMetric.findMany({
            where: { skillId },
            orderBy: { windowStart: 'desc' },
            take: 24, // Últimas 24 horas/janelas
        });
        if (metrics.length === 0) {
            return reply.send({
                skillId,
                message: 'No metrics found for this skill yet.',
                metrics: {
                    totalExecutions: 0,
                    grossRevenue: "0",
                }
            });
        }
        // Agregação bruta do array
        const aggregated = metrics.reduce((acc, curr) => {
            acc.totalExecutions += curr.totalExecutions;
            acc.successfulExecutions += curr.successfulExecutions;
            acc.failedExecutions += curr.failedExecutions;
            acc.grossRevenue += parseFloat(curr.grossRevenue);
            acc.protocolRevenue += parseFloat(curr.protocolRevenue);
            return acc;
        }, {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            grossRevenue: 0,
            protocolRevenue: 0,
        });
        return reply.send({
            skillId,
            aggregated,
            history: metrics
        });
    });
}
//# sourceMappingURL=metrics.routes.js.map