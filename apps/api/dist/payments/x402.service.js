"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x402Service = exports.X402Service = void 0;
const x402_config_1 = require("./x402.config");
class X402Service {
    verificationProvider;
    config;
    constructor(verificationProvider) {
        this.verificationProvider = verificationProvider;
        this.config = (0, x402_config_1.getX402Config)();
    }
    /**
     * Constrói o contrato de pagamento (o "preço") da rota.
     * Se o preço for substituído pela skill (override), o usa, senão vai pro padrão.
     */
    buildPaymentRequirement(priceOverride) {
        return {
            assetCode: this.config.assetCode,
            assetIssuer: this.config.assetIssuer,
            amount: priceOverride || this.config.defaultAmount,
            recipientAddress: this.config.recipientAddress,
            facilitatorUrl: this.config.facilitatorUrl,
            memo: 'x402-payment', // no futuro pode ser skill-id ou intent-id
        };
    }
    /**
     * Ponto central para checar a validade do token (e abstrair log auditável).
     */
    async verifyToken(token, options) {
        try {
            console.log(`[x402 Service] Verifying token format...`);
            if (!token || token.trim() === '') {
                return { isValid: false, errorReason: 'Empty token' };
            }
            // Delega para o provider atual (MockProvider ou L402Provider)
            const result = await this.verificationProvider.verify(token, options);
            if (result.isValid) {
                console.log(`[x402 Service] Token valid! Paid: ${result.amountPaid}`);
            }
            return result;
        }
        catch (error) {
            console.error(`[x402 Service] Error verifying token`, error);
            return { isValid: false, errorReason: 'Internal Verification Error' };
        }
    }
}
exports.X402Service = X402Service;
/**
 * Implementação Inicial: MockProvider.
 * Ele aceita a string "MOCK_TOKEN_SUCCESS" para simular a prova matemática do pagamento.
 */
class MockVerificationProvider {
    async verify(token, options) {
        // 1. Simular uma chamada de rede para o Facilitador X402
        // ex: await axios.post(facilitatorUrl, { token })
        if (token === 'MOCK_TOKEN_SUCCESS') {
            return {
                isValid: true,
                paymentHash: 'mock-tx-hash-' + Date.now(),
                amountPaid: options.priceOverride || '1.0000000',
            };
        }
        return {
            isValid: false,
            errorReason: 'Token validation failed (Mock Provider)',
        };
    }
}
// Exportar uma instância global Singleton
exports.x402Service = new X402Service(new MockVerificationProvider());
//# sourceMappingURL=x402.service.js.map