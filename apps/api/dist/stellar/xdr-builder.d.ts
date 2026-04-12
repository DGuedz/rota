import { EscrowInitInput, EscrowResult, EscrowActionInput, EscrowProofInput, EscrowSlashInput } from './stellar.types';
import { StellarClient } from './stellar.client';
export declare class XDRBuilder {
    private client;
    constructor(client: StellarClient);
    private buildTransaction;
    /**
     * Constrói o XDR Base64 para a chamada de `init_escrow` no Soroban.
     * Assinado pelo `buyer`.
     */
    buildInitEscrowXdr(input: EscrowInitInput): Promise<EscrowResult>;
    /**
     * XDR para depositar a garantia. Assinado pelo `seller`.
     */
    buildDepositBondXdr(input: EscrowActionInput): Promise<EscrowResult>;
    /**
     * XDR para submeter o hash da prova. Assinado pelo `seller`.
     */
    buildSubmitProofRefXdr(input: EscrowProofInput): Promise<EscrowResult>;
    /**
     * XDR para liquidar com sucesso. Assinado pelo `buyer` (ou admin).
     */
    buildSettleEscrowXdr(input: EscrowActionInput): Promise<EscrowResult>;
    /**
     * XDR para punir o vendedor. Assinado pelo `buyer` (ou admin).
     */
    buildSlashBondXdr(input: EscrowSlashInput): Promise<EscrowResult>;
    /**
     * XDR para cancelar o escrow. Assinado pelo `buyer` (ou admin).
     */
    buildCancelEscrowXdr(input: EscrowActionInput): Promise<EscrowResult>;
}
//# sourceMappingURL=xdr-builder.d.ts.map