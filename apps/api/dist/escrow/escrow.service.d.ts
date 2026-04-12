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
        escrowTxId: any;
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
        status: "FAILED" | "PENDING";
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
        status: EscrowStatus;
        ledger: number;
        message?: undefined;
    } | {
        status: "FAILED" | "PENDING";
        message: string;
        ledger?: undefined;
    }>;
    /**
     * Slash Escrow
     */
    buildSlash(escrowTxId: string, sourceAddress: string, slashAmount: number): Promise<import("../stellar/stellar.types").EscrowResult>;
    confirmSlash(escrowTxId: string, txHash: string): Promise<{
        status: EscrowStatus;
        ledger: number;
        message?: undefined;
    } | {
        status: "FAILED" | "PENDING";
        message: string;
        ledger?: undefined;
    }>;
    getEscrow(id: string): Promise<any>;
}
//# sourceMappingURL=escrow.service.d.ts.map