import { X402EnvironmentConfig, getX402Config } from './x402.config';
import { X402PaymentRequirement, X402VerificationResult } from './x402.types';
import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '../stellar/stellar.client';

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

class X402Service {
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
 * Implementação Real: StellarX402VerificationProvider.
 * Valida o token x402 (XDR de transação Stellar) na rede Stellar.
 */
class StellarX402VerificationProvider implements X402VerificationProvider {
  constructor(private stellarClient: StellarClient, private config: X402EnvironmentConfig) {}

  async verify(token: string, options: X402VerificationOptions): Promise<X402VerificationResult> {
    try {
      // 1. Decodificar o token (XDR)
      const transaction = StellarSdk.TransactionBuilder.fromXDR(token, this.config.networkPassphrase);

      // 2. Verificar a assinatura (a transação já deve ter sido assinada pelo pagador)
      if (!transaction.signatures || transaction.signatures.length === 0) {
        return { isValid: false, errorReason: 'Transaction not signed' };
      }

      // 3. Validar o conteúdo da transação (asset, amount, destination)
      const paymentOperation = transaction.operations.find(
        (op): op is StellarSdk.Operation.Payment => op.type === 'payment'
      );

      if (!paymentOperation) {
        return { isValid: false, errorReason: 'No payment operation found in transaction' };
      }

      const requiredAmount = options.priceOverride || this.config.defaultAmount;
      const requiredAssetCode = this.config.assetCode;
      const requiredAssetIssuer = this.config.assetIssuer;
      const requiredRecipientAddress = this.config.recipientAddress;

      // Validação do destinatário
      if (paymentOperation.destination !== requiredRecipientAddress) {
        return { isValid: false, errorReason: 'Incorrect payment recipient' };
      }

      // Validação do valor
      if (parseFloat(paymentOperation.amount) < parseFloat(requiredAmount)) {
        return { isValid: false, errorReason: `Insufficient amount paid. Required: ${requiredAmount}, Paid: ${paymentOperation.amount}` };
      }

      // Validação do ativo
      let isAssetValid = false;
      if (paymentOperation.asset.isNative()) {
        // Se o ativo for nativo (XLM), não há issuer
        isAssetValid = requiredAssetCode === 'XLM';
      } else if (paymentOperation.asset instanceof StellarSdk.Asset) {
        // Para ativos não nativos, verificar código e issuer
        isAssetValid = paymentOperation.asset.code === requiredAssetCode &&
                       paymentOperation.asset.issuer === requiredAssetIssuer;
      }

      if (!isAssetValid) {
        return { isValid: false, errorReason: 'Incorrect asset paid' };
      }

      // 4. Opcionalmente, consultar o status da transação na rede
      // Para o MVP, vamos considerar que a transação é válida se o XDR for bem formado e assinado
      // A verificação de que a transação foi de fato submetida e liquidada pode ser um passo futuro
      // const txStatus = await this.stellarClient.getTransactionStatus(transaction.hash().toString('hex'));
      // if (txStatus.status !== 'SUCCESS') {
      //   return { isValid: false, errorReason: `Transaction not settled on chain: ${txStatus.status}` };
      // }

      return {
        isValid: true,
        paymentHash: transaction.hash().toString('hex'),
        amountPaid: paymentOperation.amount,
      };
    } catch (error: any) {
      console.error(`[StellarX402VerificationProvider] Error verifying token:`, error);
      return { isValid: false, errorReason: `Invalid X402 token format or verification error: ${error.message}` };
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

// Exportar as classes para que possam ser instanciadas e configuradas em tempo de execução
export { X402Service, StellarX402VerificationProvider, MockVerificationProvider };
