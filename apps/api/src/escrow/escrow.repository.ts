import { PrismaClient, EscrowStatus } from '@prisma/client';

export class EscrowRepository {
  constructor(private prisma: PrismaClient) {}

  async createPendingEscrow(data: {
    intentId: string;
    bidId: string;
    buyerAgentId: string;
    sellerAgentId: string;
    amount: number;
    bondAmount: number;
    xdrBase64: string;
    contractId: string;
  }) {
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
        status: EscrowStatus.PENDING_XDR,
      },
    });
  }

  async findById(id: string) {
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

  async updateLockHash(id: string, stellarLockTxHash: string) {
    return this.prisma.escrowTransaction.update({
      where: { id },
      data: { stellarLockTxHash },
    });
  }

  async updateTxHash(id: string, hashField: 'stellarSettleTxHash' | 'stellarSlashTxHash', txHash: string) {
    return this.prisma.escrowTransaction.update({
      where: { id },
      data: { [hashField]: txHash },
    });
  }

  async updateStatus(id: string, status: EscrowStatus, ledger?: number) {
    return this.prisma.escrowTransaction.update({
      where: { id },
      data: { 
        status,
        lockLedger: status === EscrowStatus.LOCKED ? ledger : undefined,
        settleLedger: status === EscrowStatus.SETTLED ? ledger : undefined,
        slashLedger: status === EscrowStatus.SLASHED ? ledger : undefined,
      },
    });
  }
}
