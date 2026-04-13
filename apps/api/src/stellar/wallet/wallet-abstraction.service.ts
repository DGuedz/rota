import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '../stellar.client';
import { AgentIntent, PolicyEngine, SessionPolicy } from './policy.engine';

export interface WalletAbstractionResult {
  success: boolean;
  txHash?: string;
  errorReason?: string;
  ephemeralPublicKey?: string;
}

export class WalletAbstractionService {
  private treasuryKeypair: StellarSdk.Keypair;

  constructor(private stellarClient: StellarClient) {
    const secret = process.env.ROTA_TREASURY_SECRET;
    if (!secret) {
      throw new Error("ROTA_TREASURY_SECRET is not set in .env");
    }
    this.treasuryKeypair = StellarSdk.Keypair.fromSecret(secret);
  }

  /**
   * Executa a Intenção do Agente com Patrocínio Gasless e Session Key.
   * Valida a Política de Gastos e Contratos permitidos antes de assinar.
   */
  async executeGaslessIntent(
    intent: AgentIntent,
    policy: SessionPolicy
  ): Promise<WalletAbstractionResult> {
    try {
      // 1. Guardrail Off-Chain: O Policy Engine veta qualquer desvio
      PolicyEngine.validateIntent(intent, policy);

      // 2. Criar Chave Efêmera (Session Key) apenas para atuar como Invocadora no Contrato
      // O hackathon foca na abstração da UX. A Tesouraria da ROTA paga o Gás e envia a transação.
      const ephemeralSessionKey = StellarSdk.Keypair.random();

      console.log(`[WalletAbstraction] Session Key generated: ${ephemeralSessionKey.publicKey()}`);
      console.log(`[WalletAbstraction] Validating Intent... OK! Sponsoring TX with Treasury Account.`);

      // 3. O servidor carrega a sequência da Tesouraria (que paga as taxas)
      const treasuryAccountResponse = await this.stellarClient.server.getAccount(this.treasuryKeypair.publicKey());
      const treasuryAccount = new StellarSdk.Account(this.treasuryKeypair.publicKey(), treasuryAccountResponse.sequenceNumber());

      // 4. Montar a Invocação do Soroban
      const contract = new StellarSdk.Contract(intent.contractId);
      
      // Construir os argumentos em xdr.ScVal baseados na intenção do Agente
      // Nota: Este é um wrapper simplificado de demonstração
      const txBuilder = new StellarSdk.TransactionBuilder(treasuryAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.stellarClient.networkPassphrase,
      });

      // No MVP: a Tesouraria paga tudo, mas chama o Soroban em nome do Ephemeral ou com os dados da Intenção
      txBuilder.addOperation(contract.call(intent.method, ...intent.args));

      const tx = txBuilder.setTimeout(30).build();

      // 5. Preparar e Assinar
      const preparedTx = await this.stellarClient.server.prepareTransaction(tx);
      preparedTx.sign(this.treasuryKeypair);

      // 6. Submeter ao Soroban (Settlement Layer)
      const sendResult = await this.stellarClient.server.sendTransaction(preparedTx);

      if (sendResult.status === 'ERROR') {
        throw new Error(`Transaction submission failed: ${sendResult.errorResult}`);
      }

      console.log(`[WalletAbstraction] Tx settled! Hash: ${sendResult.hash}`);

      return {
        success: true,
        txHash: sendResult.hash,
        ephemeralPublicKey: ephemeralSessionKey.publicKey(),
      };
    } catch (error: any) {
      console.error(`[WalletAbstraction] Error executing gasless intent:`, error);
      return {
        success: false,
        errorReason: error.message || 'Unknown Execution Error',
      };
    }
  }
}
