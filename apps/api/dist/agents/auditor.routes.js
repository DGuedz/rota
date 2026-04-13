"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditorRoutes = auditorRoutes;
async function auditorRoutes(fastify, options) {
    const { prisma } = options;
    fastify.post('/execute', async (request, reply) => {
        const { targetLayer } = request.body || {};
        const auditReport = {
            layer: targetLayer || "full_stack",
            timestamp: new Date().toISOString(),
            findings: [],
            verdict: "PENDING"
        };
        // Check 1: X402 Implementation Reality
        if (targetLayer === 'x402' || !targetLayer) {
            // Forçamos a inferência genérica para escapar de tipos ausentes localmente no schema
            const logs = await prisma.paymentExecutionLog.findMany({
                where: { status: 'EXECUTED' },
                take: 10
            });
            auditReport.findings.push({
                domain: "x402_mpp",
                status: logs && logs.length > 0 ? "REAL" : "MOCKADO_OR_MISSING_EVIDENCE",
                evidenceCount: logs ? logs.length : 0,
                notes: logs && logs.length > 0 ? "Found successful x402 verifications in DB." : "No DB records found for x402 execution. Likely using MockProvider."
            });
        }
        const hasMocks = auditReport.findings.some(f => f.status.includes('MOCKADO'));
        auditReport.verdict = hasMocks ? "PROTO_VENDAVEL" : "PRODUTO_REAL";
        return reply.send({ success: true, report: auditReport });
    });
}
//# sourceMappingURL=auditor.routes.js.map