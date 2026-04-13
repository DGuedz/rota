import { EscrowStatus } from '@prisma/client';

export type SorobanEventTopic = 
  | 'INIT'
  | 'BOND'
  | 'PROOF'
  | 'SETTLED'
  | 'SLASHED'
  | 'CANCEL';

export interface RawSorobanEvent {
  type: string; // 'contract'
  ledger: string;
  ledgerClosedAt: string;
  contractId: string;
  id: string; // Cursor
  pagingToken: string;
  topic: string[]; // [Symbol("ESCROW"), Symbol("INIT"), "escrow_123"]
  value: any; // xdr.ScVal base64 encoded payload
}

export interface NormalizedDomainEvent {
  domainEventType: string; // ex: 'escrow.locked', 'escrow.bonded'
  escrowId: string;
  targetStatus: EscrowStatus;
  payload: Record<string, any>;
  ledger: number;
  txHash: string; // Id ou hash associado ao evento
  cursor: string;
}
