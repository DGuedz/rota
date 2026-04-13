import * as StellarSdk from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';
import { SorobanTxRef } from './stellar.types';

export class StellarClient {
  public server: rpc.Server;
  public networkPassphrase: string;
  public contractId: string;

  constructor() {
    // Para simplificar no MVP, conectamos na testnet por padrão.
    const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
    this.networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
    this.contractId = process.env.SOROBAN_ESCROW_CONTRACT_ID || 'C_DUMMY_CONTRACT_ID_REPLACE_ME';
    
    this.server = new rpc.Server(rpcUrl);
  }

  /**
   * Helper para buscar o status de uma transação enviada.
   * Utilizado para checar a liquidação do `stellarLockTxHash`.
   */
  async getTransactionStatus(txHash: string): Promise<SorobanTxRef> {
    try {
      const response = await this.server.getTransaction(txHash);
      return {
        txHash,
        ledger: response.latestLedger || 0,
        status: response.status === 'SUCCESS' ? 'SUCCESS' : response.status === 'FAILED' ? 'FAILED' : 'PENDING',
      };
    } catch (error) {
      console.error(`[StellarClient] Error fetching tx ${txHash}:`, error);
      return { txHash, ledger: 0, status: 'FAILED' };
    }
  }

  /**
   * Retorna a chave pública da conta Tesouraria (Paymaster) da ROTA
   */
  public getTreasuryPublicKey(): string {
    const secret = process.env.ROTA_TREASURY_SECRET;
    if (!secret) {
      throw new Error("ROTA_TREASURY_SECRET is not set in .env");
    }
    return StellarSdk.Keypair.fromSecret(secret).publicKey();
  }
}
