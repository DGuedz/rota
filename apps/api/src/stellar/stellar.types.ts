export interface EscrowInitInput {
  escrowId: string;
  buyerAddress: string;
  sellerAddress: string;
  assetAddress: string;
  amount: number;
  bondAmount: number;
  deadline: number;
  metadataHash?: string;
}

export interface EscrowActionInput {
  escrowId: string;
  sourceAddress: string;
}

export interface EscrowProofInput extends EscrowActionInput {
  proofHash: string;
}

export interface EscrowSlashInput extends EscrowActionInput {
  slashAmount: number;
}

export interface EscrowResult {
  xdrBase64: string;
  networkPassphrase: string;
  contractId: string;
}

export interface SorobanTxRef {
  txHash: string;
  ledger: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface ContractEventPayload {
  contractId: string;
  topic: string[];
  value: any;
  ledger: number;
  txHash: string;
}
