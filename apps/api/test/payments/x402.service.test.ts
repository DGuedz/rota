import { X402Service, X402VerificationProvider, StellarX402VerificationProvider } from '../../src/payments/x402.service';
import { StellarClient } from '../../src/stellar/stellar.client';
import * as StellarSdk from '@stellar/stellar-sdk';
import { getX402Config, X402EnvironmentConfig } from '../../src/payments/x402.config';
import { X402VerificationResult } from '../../src/payments/x402.types';

// Mock StellarClient para evitar chamadas de rede reais nos testes unitários
class MockStellarClient extends StellarClient {
  constructor() {
    super();
    // Sobrescrever o servidor para um mock ou não fazer nada
    this.server = {
      getTransaction: async (txHash: string) => {
        // Simular uma transação bem-sucedida
        if (txHash.startsWith('valid')) {
          return { status: 'SUCCESS', latestLedger: 100 } as any;
        }
        return { status: 'FAILED', latestLedger: 0 } as any;
      },
      getLatestLedger: async () => ({ sequence: 100 } as any),
      getEvents: async () => ({ events: [] } as any),
    } as any;
  }
}

// Implementação do StellarX402VerificationProvider para testes
class TestStellarX402VerificationProvider implements X402VerificationProvider {
  constructor(private stellarClient: StellarClient, private config: X402EnvironmentConfig) {}

  async verify(token: string, options: any): Promise<X402VerificationResult> {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(token, this.config.networkPassphrase);

      if (!transaction.signatures || transaction.signatures.length === 0) {
        return { isValid: false, errorReason: 'Transaction not signed' };
      }

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

      if (paymentOperation.destination !== requiredRecipientAddress) {
        return { isValid: false, errorReason: 'Incorrect payment recipient' };
      }

      if (parseFloat(paymentOperation.amount) < parseFloat(requiredAmount)) {
        return { isValid: false, errorReason: `Insufficient amount paid. Required: ${requiredAmount}, Paid: ${paymentOperation.amount}` };
      }

      let isAssetValid = false;
      if (paymentOperation.asset.isNative()) {
        isAssetValid = requiredAssetCode === 'XLM';
      } else if (paymentOperation.asset instanceof StellarSdk.Asset) {
        isAssetValid = paymentOperation.asset.code === requiredAssetCode &&
                       paymentOperation.asset.issuer === requiredAssetIssuer;
      }

      if (!isAssetValid) {
        return { isValid: false, errorReason: 'Incorrect asset paid' };
      }

      return {
        isValid: true,
        paymentHash: transaction.hash().toString('hex'),
        amountPaid: paymentOperation.amount,
      };
    } catch (error: any) {
      return { isValid: false, errorReason: `Invalid X402 token format or verification error: ${error.message}` };
    }
  }
}

describe('X402Service with StellarX402VerificationProvider', () => {
  let x402Service: X402Service;
  let stellarClient: MockStellarClient;
  let buyerKeys: StellarSdk.Keypair;
  let rotaRecipient: string;
  let networkPassphrase: string;
  let x402Config: X402EnvironmentConfig; // Declarar aqui

  beforeAll(() => {
    // Configurar variáveis de ambiente para o teste
    process.env.X402_FACILITATOR_URL = 'http://localhost:8080';
    process.env.X402_DEFAULT_RECIPIENT_ADDRESS = StellarSdk.Keypair.random().publicKey();
    process.env.X402_DEFAULT_ASSET_CODE = 'XLM';
    process.env.STELLAR_NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
    
    x402Config = getX402Config(); // Recarregar config após definir env vars

    stellarClient = new MockStellarClient();
    x402Service = new X402Service(new StellarX402VerificationProvider(stellarClient, x402Config));

    buyerKeys = StellarSdk.Keypair.random();
    rotaRecipient = x402Config.recipientAddress;
    networkPassphrase = x402Config.networkPassphrase;
  });

  it('should successfully verify a valid x402 payment token', async () => {
    const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
      .addOperation(StellarSdk.Operation.payment({
        destination: rotaRecipient,
        asset: StellarSdk.Asset.native(),
        amount: "0.05"
      }))
      .setTimeout(0)
      .build();

    tx.sign(buyerKeys);
    const x402Token = tx.toXDR();

    const result = await x402Service.verifyToken(x402Token, { priceOverride: '0.05' });
    expect(result.isValid).toBe(true);
    expect(result.paymentHash).toBeDefined();
    expect(parseFloat(result.amountPaid!)).toBe(0.05);
  });

  it('should reject an x402 payment token with incorrect recipient', async () => {
    const incorrectRecipient = StellarSdk.Keypair.random().publicKey();
    const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
      .addOperation(StellarSdk.Operation.payment({
        destination: incorrectRecipient,
        asset: StellarSdk.Asset.native(),
        amount: "0.05"
      }))
      .setTimeout(0)
      .build();

    tx.sign(buyerKeys);
    const x402Token = tx.toXDR();

    const result = await x402Service.verifyToken(x402Token, { priceOverride: '0.05' });
    expect(result.isValid).toBe(false);
    expect(result.errorReason).toContain('Incorrect payment recipient');
  });

  it('should reject an x402 payment token with insufficient amount', async () => {
    const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
      .addOperation(StellarSdk.Operation.payment({
        destination: rotaRecipient,
        asset: StellarSdk.Asset.native(),
        amount: "0.01" // Insufficient amount
      }))
      .setTimeout(0)
      .build();

    tx.sign(buyerKeys);
    const x402Token = tx.toXDR();

    const result = await x402Service.verifyToken(x402Token, { priceOverride: '0.05' });
    expect(result.isValid).toBe(false);
    expect(result.errorReason).toContain('Insufficient amount paid');
  });

  it('should reject an x402 payment token with incorrect asset', async () => {
    const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
      .addOperation(StellarSdk.Operation.payment({
        destination: rotaRecipient,
        asset: new StellarSdk.Asset('USD', StellarSdk.Keypair.random().publicKey()), // Incorrect asset
        amount: "0.05"
      }))
      .setTimeout(0)
      .build();

    tx.sign(buyerKeys);
    const x402Token = tx.toXDR();

    const result = await x402Service.verifyToken(x402Token, { priceOverride: '0.05' });
    expect(result.isValid).toBe(false);
    expect(result.errorReason).toContain('Incorrect asset paid');
  });

  it('should reject an unsigned x402 payment token', async () => {
    const account = new StellarSdk.Account(buyerKeys.publicKey(), "1");
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase })
      .addOperation(StellarSdk.Operation.payment({
        destination: rotaRecipient,
        asset: StellarSdk.Asset.native(),
        amount: "0.05"
      }))
      .setTimeout(0)
      .build();

    // tx.sign(buyerKeys); // Do not sign
    const x402Token = tx.toXDR();

    const result = await x402Service.verifyToken(x402Token, { priceOverride: '0.05' });
    expect(result.isValid).toBe(false);
    expect(result.errorReason).toContain('Transaction not signed');
  });

  it('should reject an invalid XDR format', async () => {
    const invalidXDR = 'invalid-xdr-string';
    const result = await x402Service.verifyToken(invalidXDR, { priceOverride: '0.05' });
    expect(result.isValid).toBe(false);
    expect(result.errorReason).toContain('Invalid X402 token format');
  });
});
