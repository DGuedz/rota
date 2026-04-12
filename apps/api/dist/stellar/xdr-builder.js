"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XDRBuilder = void 0;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
class XDRBuilder {
    client;
    constructor(client) {
        this.client = client;
    }
    async buildTransaction(sourceAddress, operation) {
        const sourceAccountInfo = await this.client.server.getAccount(sourceAddress);
        const sourceAccount = new stellar_sdk_1.Account(sourceAddress, sourceAccountInfo.sequence);
        const transaction = new stellar_sdk_1.TransactionBuilder(sourceAccount, {
            fee: '100000', // Mock fee, simulateTransaction in prod
            networkPassphrase: this.client.networkPassphrase,
        })
            .addOperation(operation)
            .setTimeout(300)
            .build();
        return {
            xdrBase64: transaction.toXDR(),
            networkPassphrase: this.client.networkPassphrase,
            contractId: this.client.contractId,
        };
    }
    /**
     * Constrói o XDR Base64 para a chamada de `init_escrow` no Soroban.
     * Assinado pelo `buyer`.
     */
    async buildInitEscrowXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('init_escrow', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.buyerAddress, { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(input.sellerAddress, { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(input.assetAddress, { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(input.amount, { type: 'i128' }), (0, stellar_sdk_1.nativeToScVal)(input.bondAmount, { type: 'i128' }), (0, stellar_sdk_1.nativeToScVal)(input.deadline, { type: 'u64' }), input.metadataHash ? (0, stellar_sdk_1.nativeToScVal)(input.metadataHash, { type: 'string' }) : stellar_sdk_1.xdr.ScVal.scvVoid());
        return this.buildTransaction(input.buyerAddress, operation);
    }
    /**
     * XDR para depositar a garantia. Assinado pelo `seller`.
     */
    async buildDepositBondXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('deposit_bond', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.sourceAddress, { type: 'address' }) // Seller
        );
        return this.buildTransaction(input.sourceAddress, operation);
    }
    /**
     * XDR para submeter o hash da prova. Assinado pelo `seller`.
     */
    async buildSubmitProofRefXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('submit_proof_ref', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.proofHash, { type: 'string' }));
        return this.buildTransaction(input.sourceAddress, operation);
    }
    /**
     * XDR para liquidar com sucesso. Assinado pelo `buyer` (ou admin).
     */
    async buildSettleEscrowXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('settle_escrow', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.sourceAddress, { type: 'address' }));
        return this.buildTransaction(input.sourceAddress, operation);
    }
    /**
     * XDR para punir o vendedor. Assinado pelo `buyer` (ou admin).
     */
    async buildSlashBondXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('slash_bond', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.sourceAddress, { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(input.slashAmount, { type: 'i128' }));
        return this.buildTransaction(input.sourceAddress, operation);
    }
    /**
     * XDR para cancelar o escrow. Assinado pelo `buyer` (ou admin).
     */
    async buildCancelEscrowXdr(input) {
        const contract = new stellar_sdk_1.Contract(this.client.contractId);
        const operation = contract.call('cancel_escrow', (0, stellar_sdk_1.nativeToScVal)(input.escrowId, { type: 'string' }), (0, stellar_sdk_1.nativeToScVal)(input.sourceAddress, { type: 'address' }));
        return this.buildTransaction(input.sourceAddress, operation);
    }
}
exports.XDRBuilder = XDRBuilder;
//# sourceMappingURL=xdr-builder.js.map