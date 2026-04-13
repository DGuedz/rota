"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x402Routes = x402Routes;
const x402_middleware_1 = require("./x402.middleware");
async function x402Routes(fastify) {
    // O middleware global para proteger rotas pagas (só ativa se x402.requiresPayment === true)
    fastify.addHook('preHandler', x402_middleware_1.x402Middleware);
    /**
     * Endpoint de Teste: Pagamento X402 (Paid Execution)
     *
     * Retorna "Payment Required (402)" se nenhum header `x-rota-payment-token` válido for enviado.
     */
    fastify.post('/test-paid-execution', {
        config: {
            x402: {
                requiresPayment: true,
                price: '5.0000000', // Override do preço base para testar
            }
        }
    }, async (request, reply) => {
        // 1. Extrair informações anexadas pelo middleware
        const paymentContext = request.x402Payment;
        // 2. Logs Estruturados de execução
        fastify.log.info({
            event: 'x402_paid_execution_success',
            paymentHash: paymentContext.paymentHash,
            amountPaid: paymentContext.amountPaid,
            path: request.url,
        });
        // 3. Devolver resultado (Skill execution simulada)
        return reply.send({
            success: true,
            message: 'You have successfully proved payment! This is the paid result.',
            paymentDetails: {
                hash: paymentContext.paymentHash,
                amount: paymentContext.amountPaid,
            },
            skillOutput: {
                insight: "ROTA turns github code into revenue.",
                timestamp: new Date().toISOString()
            }
        });
    });
    /**
     * Endpoint de Teste: Gratuito (Free Execution)
     */
    fastify.post('/test-free-execution', {
        config: {
            x402: {
                requiresPayment: false, // Bypass do Middleware
            }
        }
    }, async (request, reply) => {
        return reply.send({
            success: true,
            message: 'This is a free endpoint. No payment required.',
        });
    });
}
//# sourceMappingURL=x402.routes.js.map