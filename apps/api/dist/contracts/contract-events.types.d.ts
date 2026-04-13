import { EscrowStatus } from '@prisma/client';
export type SorobanEventTopic = 'INIT' | 'BOND' | 'PROOF' | 'SETTLED' | 'SLASHED' | 'CANCEL';
export interface RawSorobanEvent {
    type: string;
    ledger: string;
    ledgerClosedAt: string;
    contractId: string;
    id: string;
    pagingToken: string;
    topic: string[];
    value: any;
}
export interface NormalizedDomainEvent {
    domainEventType: string;
    escrowId: string;
    targetStatus: EscrowStatus;
    payload: Record<string, any>;
    ledger: number;
    txHash: string;
    cursor: string;
}
//# sourceMappingURL=contract-events.types.d.ts.map