import { rpc } from '@stellar/stellar-sdk';
import { SorobanTxRef } from './stellar.types';
export declare class StellarClient {
    server: rpc.Server;
    networkPassphrase: string;
    contractId: string;
    constructor();
    /**
     * Helper para buscar o status de uma transação enviada.
     * Utilizado para checar a liquidação do `stellarLockTxHash`.
     */
    getTransactionStatus(txHash: string): Promise<SorobanTxRef>;
}
//# sourceMappingURL=stellar.client.d.ts.map