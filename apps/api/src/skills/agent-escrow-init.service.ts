import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from '../stellar/stellar.client';
import { WalletAbstractionService } from '../stellar/wallet/wallet-abstraction.service';
import { AgentIntent, SessionPolicy } from '../stellar/wallet/policy.engine';

export interface InitEscrowRequest {
  seller: string;
  resolver: string;
  asset: string;
  amount: string; // Em unidades base, ex: "10000000" para 1 XLM
  bondAmount: string;
  deadline: number;
  disputeDeadline: number;
  metadataHash: string;
}

export class AgentEscrowInitSkill {
  constructor(
    private stellarClient: StellarClient,
    private walletAbstraction: WalletAbstractionService
  ) {}

  /**
   * The "Golden Skill"
   * Um agente IA paga o pedágio x402 e manda sua intenção de iniciar um Escrow.
   * Nós provisionamos a Session Key, validamos a Policy e patrocinamos o Gás.
   */
  async execute(request: InitEscrowRequest) {
    console.log(`[AgentEscrowInitSkill] Initializing escrow intent for agent...`);

    // Montando a Intenção do Agente
    const intent: AgentIntent = {
      contractId: this.stellarClient.contractId, // O contrato oficial da ROTA Escrow
      method: 'init_escrow',
      args: [
        StellarSdk.nativeToScVal('escrow_' + Date.now().toString(), { type: 'string' }), // escrow_id
        StellarSdk.xdr.ScVal.scvAddress(StellarSdk.Address.fromString(this.stellarClient.getTreasuryPublicKey()).toScAddress()), // A ROTA está pagando pelo buyer via tesouraria
        StellarSdk.xdr.ScVal.scvAddress(StellarSdk.Address.fromString(request.seller).toScAddress()),
        StellarSdk.xdr.ScVal.scvAddress(StellarSdk.Address.fromString(request.resolver).toScAddress()),
        StellarSdk.xdr.ScVal.scvAddress(StellarSdk.Address.fromString(request.asset).toScAddress()),
        StellarSdk.nativeToScVal(Number(request.amount), { type: 'i128' }),
        StellarSdk.nativeToScVal(Number(request.bondAmount), { type: 'i128' }),
        StellarSdk.nativeToScVal(request.deadline, { type: 'u64' }),
        StellarSdk.nativeToScVal(request.disputeDeadline, { type: 'u64' }),
        StellarSdk.nativeToScVal(request.metadataHash, { type: 'string' }), // metadata_hash (Option<String>)
      ],
      amount: request.amount,
    };

    // Definindo a Política de Gastos da Sessão Efêmera
    // Defense in Depth: O Agente só pode chamar 'init_escrow' no contrato da ROTA,
    // e o valor não pode ultrapassar o teto estrito (ex: 500 XLM).
    const sessionPolicy: SessionPolicy = {
      allowedContractIds: [this.stellarClient.contractId],
      allowedMethods: ['init_escrow'],
      maxAmountPerTx: 500 * 10000000, // 500 XLM em stroops
      expiresAt: Date.now() + 15 * 60 * 1000, // Válida por 15 min
    };

    // Delega a execução onchain real para a Wallet Abstraction
    const result = await this.walletAbstraction.executeGaslessIntent(intent, sessionPolicy);

    if (!result.success) {
      throw new Error(`Execution failed: ${result.errorReason}`);
    }

    return {
      message: 'Escrow initialized successfully via Agentic Skill Layer',
      txHash: result.txHash,
      ephemeralPublicKeyUsed: result.ephemeralPublicKey,
      policyApplied: {
        maxAmountPerTx: sessionPolicy.maxAmountPerTx,
        expiresAt: new Date(sessionPolicy.expiresAt).toISOString(),
      }
    };
  }
}
