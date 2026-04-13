import { EscrowStatus } from '@prisma/client';
import { RawSorobanEvent, NormalizedDomainEvent, SorobanEventTopic } from './contract-events.types';
import { xdr, scValToNative } from '@stellar/stellar-sdk';

export class ContractEventsMapper {
  /**
   * Converte um evento nativo do Soroban em um evento de domínio normalizado
   * que o backend da ROTA possa entender e conciliar.
   */
  static mapToDomain(raw: RawSorobanEvent): NormalizedDomainEvent | null {
    try {
      // Soroban topics are usually emitted as symbols/strings. 
      // The first is usually the module name (e.g. "ESCROW")
      // The second is the specific action (e.g. "INIT")
      // The third is often the primary key (e.g. escrow_id)

      if (raw.topic.length < 3) return null;

      const moduleTopic = this.decodeTopicString(raw.topic[0]);
      if (moduleTopic !== 'ESCROW') return null;

      const actionTopic = this.decodeTopicString(raw.topic[1]) as SorobanEventTopic;
      const escrowId = this.decodeTopicString(raw.topic[2]);

      const scVal = xdr.ScVal.fromXDR(raw.value, 'base64');
      const payload = scValToNative(scVal);

      switch (actionTopic) {
        case 'INIT':
          return {
            domainEventType: 'escrow.locked',
            escrowId,
            targetStatus: EscrowStatus.LOCKED,
            payload: { buyer: payload[0], seller: payload[1], amount: payload[2] },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id, // Or extract from a specific field if Soroban RPC includes it
            cursor: raw.pagingToken,
          };
        
        case 'BOND':
          return {
            domainEventType: 'escrow.bonded',
            escrowId,
            targetStatus: EscrowStatus.EXECUTING, // In ROTA, BOND means executing phase
            payload: { seller: payload[0], bondAmount: payload[1] },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id,
            cursor: raw.pagingToken,
          };

        case 'PROOF':
          return {
            domainEventType: 'proof.submitted',
            escrowId,
            targetStatus: EscrowStatus.PROOF_SUBMITTED,
            payload: { proofHash: payload },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id,
            cursor: raw.pagingToken,
          };

        case 'SETTLED':
          return {
            domainEventType: 'escrow.settled',
            escrowId,
            targetStatus: EscrowStatus.SETTLED,
            payload: { buyer: payload[0], seller: payload[1], amountPaid: payload[2] },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id,
            cursor: raw.pagingToken,
          };

        case 'SLASHED':
          return {
            domainEventType: 'escrow.slashed',
            escrowId,
            targetStatus: EscrowStatus.SLASHED,
            payload: { seller: payload[0], slashAmount: payload[1] },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id,
            cursor: raw.pagingToken,
          };

        case 'CANCEL':
          return {
            domainEventType: 'escrow.cancelled',
            escrowId,
            targetStatus: EscrowStatus.CANCELLED,
            payload: { previousStatus: payload },
            ledger: parseInt(raw.ledger, 10),
            txHash: raw.id,
            cursor: raw.pagingToken,
          };

        default:
          console.warn(`[Mapper] Unknown action topic: ${actionTopic}`);
          return null;
      }
    } catch (err) {
      console.error('[Mapper] Failed to map event', err);
      return null;
    }
  }

  private static decodeTopicString(topicXdrBase64: string): string {
    try {
      const scVal = xdr.ScVal.fromXDR(topicXdrBase64, 'base64');
      // A topic could be a Symbol or a String in Soroban
      const val = scValToNative(scVal);
      return typeof val === 'string' ? val : String(val);
    } catch (e) {
      return '';
    }
  }
}
