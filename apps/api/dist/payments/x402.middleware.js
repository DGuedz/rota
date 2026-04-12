"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x402Middleware = x402Middleware;
const x402_constants_1 = require("./x402.constants");
// Inject service via factory or global instance
const x402_service_1 = require("./x402.service");
async function x402Middleware(request, reply) {
    // 1. O middleware extrai a configuração de pagamento anexada à rota
    const routeConfig = request.routeOptions.config?.x402;
    // 2. Se a rota não exige pagamento, libera o fluxo.
    if (!routeConfig || !routeConfig.requiresPayment) {
        return;
    }
    // 3. Busca o token no cabeçalho
    const paymentToken = request.headers[x402_constants_1.X402_CONSTANTS.HEADER_PAYMENT_TOKEN];
    if (!paymentToken) {
        return replyPaymentRequired(reply, routeConfig);
    }
    // 4. Delega a verificação do token para o service
    const result = await x402_service_1.x402Service.verifyToken(paymentToken, {
        priceOverride: routeConfig.price,
        routeUrl: request.url,
    });
    if (!result.isValid) {
        request.log.warn(`[X402] Invalid token for ${request.url}: ${result.errorReason}`);
        return replyPaymentRequired(reply, routeConfig);
    }
    // 5. Fluxo liberado, anexa os metadados do pagamento para a skill real usar
    request.x402Payment = {
        paymentHash: result.paymentHash,
        amountPaid: result.amountPaid
    };
}
/**
 * Função utilitária que constrói a resposta 402 Payment Required
 * seguindo as normas RFC adaptadas para o padrão ROTA.
 */
function replyPaymentRequired(reply, config) {
    const requirement = x402_service_1.x402Service.buildPaymentRequirement(config.price);
    // A RFC dita que devemos responder com status 402 e cabeçalho Www-Authenticate
    const authenticateHeader = `${x402_constants_1.X402_CONSTANTS.AUTH_SCHEME} amount="${requirement.amount}", asset="${requirement.assetCode}", recipient="${requirement.recipientAddress}", url="${requirement.facilitatorUrl}"`;
    return reply
        .code(x402_constants_1.X402_CONSTANTS.HTTP_STATUS_PAYMENT_REQUIRED)
        .header(x402_constants_1.X402_CONSTANTS.HEADER_PAYMENT_REQUIRED, authenticateHeader)
        .send({
        error: 'Payment Required',
        message: 'This endpoint requires an X402 payment proof to execute.',
        requirement
    });
}
//# sourceMappingURL=x402.middleware.js.map