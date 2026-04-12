import { X402PaymentRequirement, X402VerificationResult } from './x402.types';
export interface X402VerificationOptions {
    priceOverride?: string;
    routeUrl?: string;
}
/**
 * Interface que todo "verificador de token x402" deverá assinar.
 * Hoje usaremos um Mock/Local Provider, amanhã será a infraestrutura Stellar real (Soroban/LND).
 */
export interface X402VerificationProvider {
    verify(token: string, options: X402VerificationOptions): Promise<X402VerificationResult>;
}
export declare class X402Service {
    private verificationProvider;
    private config;
    constructor(verificationProvider: X402VerificationProvider);
    /**
     * Constrói o contrato de pagamento (o "preço") da rota.
     * Se o preço for substituído pela skill (override), o usa, senão vai pro padrão.
     */
    buildPaymentRequirement(priceOverride?: string): X402PaymentRequirement;
    /**
     * Ponto central para checar a validade do token (e abstrair log auditável).
     */
    verifyToken(token: string, options: X402VerificationOptions): Promise<X402VerificationResult>;
}
export declare const x402Service: X402Service;
//# sourceMappingURL=x402.service.d.ts.map