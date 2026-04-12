"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowRepository = void 0;
const client_1 = require("@prisma/client");
class EscrowRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPendingEscrow(data) {
        return this.prisma.escrowTransaction.create({
            data: {
                intentId: data.intentId,
                bidId: data.bidId,
                buyerAgentId: data.buyerAgentId,
                sellerAgentId: data.sellerAgentId,
                amount: data.amount,
                bondAmount: data.bondAmount,
                xdrBase64: data.xdrBase64,
                contractId: data.contractId,
                status: client_1.EscrowStatus.PENDING_XDR,
            },
        });
    }
    async findById(id) {
        return this.prisma.escrowTransaction.findUnique({
            where: { id },
            include: {
                buyerAgent: true,
                sellerAgent: true,
                intent: true,
                bid: true,
            },
        });
    }
    async updateLockHash(id, stellarLockTxHash) {
        return this.prisma.escrowTransaction.update({
            where: { id },
            data: { stellarLockTxHash },
        });
    }
    async updateTxHash(id, hashField, txHash) {
        return this.prisma.escrowTransaction.update({
            where: { id },
            data: { [hashField]: txHash },
        });
    }
    async updateStatus(id, status, ledger) {
        return this.prisma.escrowTransaction.update({
            where: { id },
            data: {
                status,
                lockLedger: status === client_1.EscrowStatus.LOCKED ? ledger : undefined,
                settleLedger: status === client_1.EscrowStatus.SETTLED ? ledger : undefined,
                slashLedger: status === client_1.EscrowStatus.SLASHED ? ledger : undefined,
            },
        });
    }
}
exports.EscrowRepository = EscrowRepository;
//# sourceMappingURL=escrow.repository.js.map