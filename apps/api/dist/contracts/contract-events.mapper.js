"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventsMapper = void 0;
const client_1 = require("@prisma/client");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
class ContractEventsMapper {
    /**
     * Converte um evento nativo do Soroban em um evento de domínio normalizado
     * que o backend da ROTA possa entender e conciliar.
     */
    static mapToDomain(raw) {
        try {
            // Soroban topics are usually emitted as symbols/strings. 
            // The first is usually the module name (e.g. "ESCROW")
            // The second is the specific action (e.g. "INIT")
            // The third is often the primary key (e.g. escrow_id)
            if (raw.topic.length < 3)
                return null;
            const moduleTopic = this.decodeTopicString(raw.topic[0]);
            if (moduleTopic !== 'ESCROW')
                return null;
            const actionTopic = this.decodeTopicString(raw.topic[1]);
            const escrowId = this.decodeTopicString(raw.topic[2]);
            const scVal = stellar_sdk_1.xdr.ScVal.fromXDR(raw.value, 'base64');
            const payload = (0, stellar_sdk_1.scValToNative)(scVal);
            switch (actionTopic) {
                case 'INIT':
                    return {
                        domainEventType: 'escrow.locked',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.LOCKED,
                        payload: { buyer: payload[0], seller: payload[1], amount: payload[2] },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id, // Or extract from a specific field if Soroban RPC includes it
                        cursor: raw.pagingToken,
                    };
                case 'BOND':
                    return {
                        domainEventType: 'escrow.bonded',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.EXECUTING, // In ROTA, BOND means executing phase
                        payload: { seller: payload[0], bondAmount: payload[1] },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id,
                        cursor: raw.pagingToken,
                    };
                case 'PROOF':
                    return {
                        domainEventType: 'proof.submitted',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.PROOF_SUBMITTED,
                        payload: { proofHash: payload },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id,
                        cursor: raw.pagingToken,
                    };
                case 'SETTLED':
                    return {
                        domainEventType: 'escrow.settled',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.SETTLED,
                        payload: { buyer: payload[0], seller: payload[1], amountPaid: payload[2] },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id,
                        cursor: raw.pagingToken,
                    };
                case 'SLASHED':
                    return {
                        domainEventType: 'escrow.slashed',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.SLASHED,
                        payload: { seller: payload[0], slashAmount: payload[1] },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id,
                        cursor: raw.pagingToken,
                    };
                case 'CANCEL':
                    return {
                        domainEventType: 'escrow.cancelled',
                        escrowId,
                        targetStatus: client_1.EscrowStatus.CANCELLED,
                        payload: { previousStatus: payload },
                        ledger: parseInt(raw.ledger, 10),
                        txHash: raw.id,
                        cursor: raw.pagingToken,
                    };
                default:
                    console.warn(`[Mapper] Unknown action topic: ${actionTopic}`);
                    return null;
            }
        }
        catch (err) {
            console.error('[Mapper] Failed to map event', err);
            return null;
        }
    }
    static decodeTopicString(topicXdrBase64) {
        try {
            const scVal = stellar_sdk_1.xdr.ScVal.fromXDR(topicXdrBase64, 'base64');
            // A topic could be a Symbol or a String in Soroban
            const val = (0, stellar_sdk_1.scValToNative)(scVal);
            return typeof val === 'string' ? val : String(val);
        }
        catch (e) {
            return '';
        }
    }
}
exports.ContractEventsMapper = ContractEventsMapper;
//# sourceMappingURL=contract-events.mapper.js.map