import { EscrowRepository } from './escrow.repository';
import { XDRBuilder } from '../stellar/xdr-builder';
import { StellarClient } from '../stellar/stellar.client';
import { RotaEventBus } from '../events/event-bus';
import { EventSource, EscrowStatus } from '@prisma/client';

export class EscrowService {
  constructor(
    private repository: EscrowRepository,
    private xdrBuilder: XDRBuilder,
    private stellarClient: StellarClient,
    private eventBus: RotaEventBus
  ) {}

  /**
   * 1. Inicia o fluxo de Escrow: Recebe intent e bid, constrói XDR e persiste PENDING.
   */
  async initEscrow(payload: {
    intentId: string;
    bidId: string;
    buyerAgentId: string;
    buyerAddress: string;
    sellerAgentId: string;
    sellerAddress: string;
    assetAddress: string;
    amount: number;
    bondAmount: number;
    deadline: number;
  }) {
    // Geração do XDR base64 do contrato Soroban
    const escrowId = `escrow_${Date.now()}`;
    const xdrResult = await this.xdrBuilder.buildInitEscrowXdr({
      escrowId,
      buyerAddress: payload.buyerAddress,
      sellerAddress: payload.sellerAddress,
      assetAddress: payload.assetAddress,
      amount: payload.amount,
      bondAmount: payload.bondAmount,
      deadline: payload.deadline,
    });

    // Persiste a transação em estado pendente aguardando a confirmação da rede
    const escrowTx = await this.repository.createPendingEscrow({
      intentId: payload.intentId,
      bidId: payload.bidId,
      buyerAgentId: payload.buyerAgentId,
      sellerAgentId: payload.sellerAgentId,
      amount: payload.amount,
      bondAmount: payload.bondAmount,
      xdrBase64: xdrResult.xdrBase64,
      contractId: xdrResult.contractId,
    });

    return {
      escrowTxId: escrowTx.id,
      xdrBase64: xdrResult.xdrBase64,
      networkPassphrase: xdrResult.networkPassphrase,
    };
  }

  /**
   * 2. Confirmação do Lock. Chamado pelo agent/frontend após assinar e submeter a tx.
   */
  async confirmLock(escrowTxId: string, txHash: string) {
    const escrowTx = await this.repository.findById(escrowTxId);
    if (!escrowTx) throw new Error('Escrow transaction not found');

    // Registra a hash imediatamente
    await this.repository.updateLockHash(escrowTxId, txHash);

    // Consulta a testnet para checar o status
    const statusRef = await this.stellarClient.getTransactionStatus(txHash);

    if (statusRef.status === 'SUCCESS') {
      await this.repository.updateStatus(escrowTxId, EscrowStatus.LOCKED, statusRef.ledger);

      // Emitimos o evento interno para o Agent Runtime reagir
      await this.eventBus.publish(
        'BACKEND' as EventSource,
        'escrow.locked',
        {
          escrowTxId,
          intentId: escrowTx.intentId,
          txHash,
          ledger: statusRef.ledger
        }
      );

      return { status: 'LOCKED', ledger: statusRef.ledger };
    }

    return { status: statusRef.status, message: 'Transaction pending or failed' };
  }

  /**
   * Helper generico para confirmar transações subsequentes
   */
  private async confirmAction(
    escrowTxId: string, 
    txHash: string, 
    hashField: 'stellarSettleTxHash' | 'stellarSlashTxHash',
    targetStatus: EscrowStatus,
    eventName: string
  ) {
    const escrowTx = await this.repository.findById(escrowTxId);
    if (!escrowTx) throw new Error('Escrow transaction not found');

    await this.repository.updateTxHash(escrowTxId, hashField, txHash);
    const statusRef = await this.stellarClient.getTransactionStatus(txHash);

    if (statusRef.status === 'SUCCESS') {
      await this.repository.updateStatus(escrowTxId, targetStatus, statusRef.ledger);

      await this.eventBus.publish('BACKEND' as EventSource, eventName, {
        escrowTxId,
        intentId: escrowTx.intentId,
        txHash,
        ledger: statusRef.ledger
      });

      return { status: targetStatus, ledger: statusRef.ledger };
    }
    return { status: statusRef.status, message: 'Transaction pending or failed' };
  }

  /**
   * Settle Escrow
   */
  async buildSettle(escrowTxId: string, sourceAddress: string) {
    const escrowTx = await this.repository.findById(escrowTxId);
    if (!escrowTx) throw new Error('Escrow not found');
    
    return this.xdrBuilder.buildSettleEscrowXdr({
      escrowId: escrowTxId,
      sourceAddress
    });
  }

  async confirmSettle(escrowTxId: string, txHash: string) {
    return this.confirmAction(escrowTxId, txHash, 'stellarSettleTxHash', EscrowStatus.SETTLED, 'escrow.settled');
  }

  /**
   * Slash Escrow
   */
  async buildSlash(escrowTxId: string, sourceAddress: string, slashAmount: number) {
    const escrowTx = await this.repository.findById(escrowTxId);
    if (!escrowTx) throw new Error('Escrow not found');

    return this.xdrBuilder.buildSlashBondXdr({
      escrowId: escrowTxId,
      sourceAddress,
      slashAmount
    });
  }

  async confirmSlash(escrowTxId: string, txHash: string) {
    return this.confirmAction(escrowTxId, txHash, 'stellarSlashTxHash', EscrowStatus.SLASHED, 'escrow.slashed');
  }

  async getEscrow(id: string) {
    return this.repository.findById(id);
  }
}
