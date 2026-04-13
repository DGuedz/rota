import { EscrowRepository } from './escrow.repository';
import { XDRBuilder } from '../stellar/xdr-builder';
import { StellarClient } from '../stellar/stellar.client';
import { RotaEventBus } from '../events/event-bus';
export declare class EscrowService {
    private repository;
    private xdrBuilder;
    private stellarClient;
    private eventBus;
    constructor(repository: EscrowRepository, xdrBuilder: XDRBuilder, stellarClient: StellarClient, eventBus: RotaEventBus);
    /**
     * 1. Inicia o fluxo de Escrow: Recebe intent e bid, constrói XDR e persiste PENDING.
     */
    initEscrow(payload: {
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
    }): Promise<{
        escrowTxId: string;
        xdrBase64: string;
        networkPassphrase: string;
    }>;
    /**
     * 2. Confirmação do Lock. Chamado pelo agent/frontend após assinar e submeter a tx.
     */
    confirmLock(escrowTxId: string, txHash: string): Promise<{
        status: string;
        ledger: number;
        message?: undefined;
    } | {
        status: "PENDING" | "FAILED";
        message: string;
        ledger?: undefined;
    }>;
    /**
     * Helper generico para confirmar transações subsequentes
     */
    private confirmAction;
    /**
     * Settle Escrow
     */
    buildSettle(escrowTxId: string, sourceAddress: string): Promise<import("../stellar/stellar.types").EscrowResult>;
    confirmSettle(escrowTxId: string, txHash: string): Promise<{
        status: import(".prisma/client").$Enums.EscrowStatus;
        ledger: number;
        message?: undefined;
    } | {
        status: "PENDING" | "FAILED";
        message: string;
        ledger?: undefined;
    }>;
    /**
     * Slash Escrow
     */
    buildSlash(escrowTxId: string, sourceAddress: string, slashAmount: number): Promise<import("../stellar/stellar.types").EscrowResult>;
    confirmSlash(escrowTxId: string, txHash: string): Promise<{
        status: import(".prisma/client").$Enums.EscrowStatus;
        ledger: number;
        message?: undefined;
    } | {
        status: "PENDING" | "FAILED";
        message: string;
        ledger?: undefined;
    }>;
    getEscrow(id: string): Promise<({
        intent: {
            id: string;
            status: import(".prisma/client").$Enums.IntentStatus;
            buyerAgentId: string;
            createdAt: Date;
            updatedAt: Date;
            skillId: string | null;
            title: string;
            description: string | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            preferredAssetCode: string;
            preferredAssetIssuer: string | null;
            requiredBond: import("@prisma/client/runtime/library").Decimal | null;
            minReputation: number;
            deadlineAt: Date | null;
            validationCriteria: import("@prisma/client/runtime/library").JsonValue | null;
            selectedBidId: string | null;
        };
        bid: {
            id: string;
            status: import(".prisma/client").$Enums.BidStatus;
            sellerAgentId: string;
            bondAmount: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            slaSeconds: number;
            quotePayload: import("@prisma/client/runtime/library").JsonValue | null;
            rfqId: string;
            skillId: string | null;
        };
        buyerAgent: {
            id: string;
            status: import(".prisma/client").$Enums.AgentStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            walletAddress: string;
            displayName: string | null;
            reputationScore: number;
            totalExecutions: number;
            totalSuccesses: number;
            totalDisputes: number;
            totalStrikes: number;
        };
        sellerAgent: {
            id: string;
            status: import(".prisma/client").$Enums.AgentStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            walletAddress: string;
            displayName: string | null;
            reputationScore: number;
            totalExecutions: number;
            totalSuccesses: number;
            totalDisputes: number;
            totalStrikes: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EscrowStatus;
        intentId: string;
        bidId: string;
        stellarLockTxHash: string | null;
        stellarSettleTxHash: string | null;
        stellarSlashTxHash: string | null;
        buyerAgentId: string;
        sellerAgentId: string;
        assetCode: string;
        assetIssuer: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        bondAmount: import("@prisma/client/runtime/library").Decimal;
        contractId: string | null;
        xdrBase64: string | null;
        lockLedger: number | null;
        settleLedger: number | null;
        slashLedger: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
//# sourceMappingURL=escrow.service.d.ts.map