import { X402EnvironmentConfig, getX402Config } from './x402.config';
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

export class X402Service {
  private config: X402EnvironmentConfig;

  constructor(private verificationProvider: X402VerificationProvider) {
    this.config = getX402Config();
  }

  /**
   * Constrói o contrato de pagamento (o "preço") da rota.
   * Se o preço for substituído pela skill (override), o usa, senão vai pro padrão.
   */
  buildPaymentRequirement(priceOverride?: string): X402PaymentRequirement {
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
  async verifyToken(token: string, options: X402VerificationOptions): Promise<X402VerificationResult> {
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
    } catch (error: any) {
      console.error(`[x402 Service] Error verifying token`, error);
      return { isValid: false, errorReason: 'Internal Verification Error' };
    }
  }
}

/**
 * Implementação Inicial: MockProvider.
 * Ele aceita a string "MOCK_TOKEN_SUCCESS" para simular a prova matemática do pagamento.
 */
class MockVerificationProvider implements X402VerificationProvider {
  async verify(token: string, options: X402VerificationOptions): Promise<X402VerificationResult> {
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
export const x402Service = new X402Service(new MockVerificationProvider());
