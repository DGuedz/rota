import { PrismaClient, EscrowStatus } from '@prisma/client';
export declare class EscrowRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createPendingEscrow(data: {
        intentId: string;
        bidId: string;
        buyerAgentId: string;
        sellerAgentId: string;
        amount: number;
        bondAmount: number;
        xdrBase64: string;
        contractId: string;
    }): Promise<any>;
    findById(id: string): Promise<any>;
    updateLockHash(id: string, stellarLockTxHash: string): Promise<any>;
    updateTxHash(id: string, hashField: 'stellarSettleTxHash' | 'stellarSlashTxHash', txHash: string): Promise<any>;
    updateStatus(id: string, status: EscrowStatus, ledger?: number): Promise<any>;
}
//# sourceMappingURL=escrow.repository.d.ts.map