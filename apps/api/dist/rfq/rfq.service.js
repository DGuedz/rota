"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RFQService = void 0;
class RFQService {
    repository;
    eventBus;
    constructor(repository, eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async openRFQ(intentId, buyerAgentId, payload) {
        const rfq = await this.repository.createRFQ(intentId, buyerAgentId, payload?.closesAt, payload?.broadcastPayload);
        await this.eventBus.publish('BACKEND', 'rfq.created', {
            rfqId: rfq.id,
            intentId: rfq.intentId,
            buyerAgentId: rfq.buyerAgentId,
        });
        return rfq;
    }
    async getRFQ(id) {
        return this.repository.findById(id);
    }
    async awardRFQ(rfqId, bidId) {
        const rfq = await this.repository.awardRFQ(rfqId, bidId);
        await this.eventBus.publish('BACKEND', 'rfq.awarded', {
            rfqId: rfq.id,
            intentId: rfq.intentId,
            buyerAgentId: rfq.buyerAgentId,
            awardedBidId: bidId,
        });
        return rfq;
    }
    async expireRFQ(rfqId) {
        const rfq = await this.repository.expireRFQ(rfqId);
        await this.eventBus.publish('BACKEND', 'rfq.expired', {
            rfqId: rfq.id,
            intentId: rfq.intentId,
        });
        return rfq;
    }
}
exports.RFQService = RFQService;
//# sourceMappingURL=rfq.service.js.map