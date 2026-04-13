"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowService = void 0;
const client_1 = require("@prisma/client");
class EscrowService {
    repository;
    xdrBuilder;
    stellarClient;
    eventBus;
    constructor(repository, xdrBuilder, stellarClient, eventBus) {
        this.repository = repository;
        this.xdrBuilder = xdrBuilder;
        this.stellarClient = stellarClient;
        this.eventBus = eventBus;
    }
    /**
     * 1. Inicia o fluxo de Escrow: Recebe intent e bid, constrói XDR e persiste PENDING.
     */
    async initEscrow(payload) {
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
    async confirmLock(escrowTxId, txHash) {
        const escrowTx = await this.repository.findById(escrowTxId);
        if (!escrowTx)
            throw new Error('Escrow transaction not found');
        // Registra a hash imediatamente
        await this.repository.updateLockHash(escrowTxId, txHash);
        // Consulta a testnet para checar o status
        const statusRef = await this.stellarClient.getTransactionStatus(txHash);
        if (statusRef.status === 'SUCCESS') {
            await this.repository.updateStatus(escrowTxId, client_1.EscrowStatus.LOCKED, statusRef.ledger);
            // Emitimos o evento interno para o Agent Runtime reagir
            await this.eventBus.publish('BACKEND', 'escrow.locked', {
                escrowTxId,
                intentId: escrowTx.intentId,
                txHash,
                ledger: statusRef.ledger
            });
            return { status: 'LOCKED', ledger: statusRef.ledger };
        }
        return { status: statusRef.status, message: 'Transaction pending or failed' };
    }
    /**
     * Helper generico para confirmar transações subsequentes
     */
    async confirmAction(escrowTxId, txHash, hashField, targetStatus, eventName) {
        const escrowTx = await this.repository.findById(escrowTxId);
        if (!escrowTx)
            throw new Error('Escrow transaction not found');
        await this.repository.updateTxHash(escrowTxId, hashField, txHash);
        const statusRef = await this.stellarClient.getTransactionStatus(txHash);
        if (statusRef.status === 'SUCCESS') {
            await this.repository.updateStatus(escrowTxId, targetStatus, statusRef.ledger);
            await this.eventBus.publish('BACKEND', eventName, {
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
    async buildSettle(escrowTxId, sourceAddress) {
        const escrowTx = await this.repository.findById(escrowTxId);
        if (!escrowTx)
            throw new Error('Escrow not found');
        return this.xdrBuilder.buildSettleEscrowXdr({
            escrowId: escrowTxId,
            sourceAddress
        });
    }
    async confirmSettle(escrowTxId, txHash) {
        return this.confirmAction(escrowTxId, txHash, 'stellarSettleTxHash', client_1.EscrowStatus.SETTLED, 'escrow.settled');
    }
    /**
     * Slash Escrow
     */
    async buildSlash(escrowTxId, sourceAddress, slashAmount) {
        const escrowTx = await this.repository.findById(escrowTxId);
        if (!escrowTx)
            throw new Error('Escrow not found');
        return this.xdrBuilder.buildSlashBondXdr({
            escrowId: escrowTxId,
            sourceAddress,
            slashAmount
        });
    }
    async confirmSlash(escrowTxId, txHash) {
        return this.confirmAction(escrowTxId, txHash, 'stellarSlashTxHash', client_1.EscrowStatus.SLASHED, 'escrow.slashed');
    }
    async getEscrow(id) {
        return this.repository.findById(id);
    }
}
exports.EscrowService = EscrowService;
//# sourceMappingURL=escrow.service.js.map