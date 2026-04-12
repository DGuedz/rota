import { TransactionBuilder, Account, xdr, Contract, nativeToScVal } from '@stellar/stellar-sdk';
import { 
  EscrowInitInput, 
  EscrowResult, 
  EscrowActionInput, 
  EscrowProofInput, 
  EscrowSlashInput 
} from './stellar.types';
import { StellarClient } from './stellar.client';

export class XDRBuilder {
  constructor(private client: StellarClient) {}

  private async buildTransaction(sourceAddress: string, operation: xdr.Operation): Promise<EscrowResult> {
    const sourceAccountInfo = await this.client.server.getAccount(sourceAddress);
    const sourceAccount = new Account(sourceAddress, sourceAccountInfo.sequence);

    const transaction = new TransactionBuilder(sourceAccount, {
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
  async buildInitEscrowXdr(input: EscrowInitInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    
    const operation = contract.call(
      'init_escrow',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.buyerAddress, { type: 'address' }),
      nativeToScVal(input.sellerAddress, { type: 'address' }),
      nativeToScVal(input.assetAddress, { type: 'address' }),
      nativeToScVal(input.amount, { type: 'i128' }),
      nativeToScVal(input.bondAmount, { type: 'i128' }),
      nativeToScVal(input.deadline, { type: 'u64' }),
      input.metadataHash ? nativeToScVal(input.metadataHash, { type: 'string' }) : xdr.ScVal.scvVoid()
    );

    return this.buildTransaction(input.buyerAddress, operation);
  }

  /**
   * XDR para depositar a garantia. Assinado pelo `seller`.
   */
  async buildDepositBondXdr(input: EscrowActionInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    const operation = contract.call(
      'deposit_bond',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.sourceAddress, { type: 'address' }) // Seller
    );
    return this.buildTransaction(input.sourceAddress, operation);
  }

  /**
   * XDR para submeter o hash da prova. Assinado pelo `seller`.
   */
  async buildSubmitProofRefXdr(input: EscrowProofInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    const operation = contract.call(
      'submit_proof_ref',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.proofHash, { type: 'string' })
    );
    return this.buildTransaction(input.sourceAddress, operation);
  }

  /**
   * XDR para liquidar com sucesso. Assinado pelo `buyer` (ou admin).
   */
  async buildSettleEscrowXdr(input: EscrowActionInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    const operation = contract.call(
      'settle_escrow',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.sourceAddress, { type: 'address' })
    );
    return this.buildTransaction(input.sourceAddress, operation);
  }

  /**
   * XDR para punir o vendedor. Assinado pelo `buyer` (ou admin).
   */
  async buildSlashBondXdr(input: EscrowSlashInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    const operation = contract.call(
      'slash_bond',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.sourceAddress, { type: 'address' }),
      nativeToScVal(input.slashAmount, { type: 'i128' })
    );
    return this.buildTransaction(input.sourceAddress, operation);
  }

  /**
   * XDR para cancelar o escrow. Assinado pelo `buyer` (ou admin).
   */
  async buildCancelEscrowXdr(input: EscrowActionInput): Promise<EscrowResult> {
    const contract = new Contract(this.client.contractId);
    const operation = contract.call(
      'cancel_escrow',
      nativeToScVal(input.escrowId, { type: 'string' }),
      nativeToScVal(input.sourceAddress, { type: 'address' })
    );
    return this.buildTransaction(input.sourceAddress, operation);
  }
}
