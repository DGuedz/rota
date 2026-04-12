"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidService = void 0;
class BidService {
    repository;
    eventBus;
    constructor(repository, eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async submitBid(rfqId, sellerAgentId, payload) {
        const bid = await this.repository.createBid({
            rfqId,
            sellerAgentId,
            skillId: payload.skillId,
            price: payload.price,
            bondAmount: payload.bondAmount,
            slaSeconds: payload.slaSeconds,
            quotePayload: payload.quotePayload
        });
        await this.eventBus.publish('BACKEND', 'rfq.bid_submitted', {
            bidId: bid.id,
            rfqId: bid.rfqId,
            sellerAgentId: bid.sellerAgentId,
            price: bid.price,
        });
        return bid;
    }
    async getBidsForRFQ(rfqId) {
        return this.repository.findByRfq(rfqId);
    }
}
exports.BidService = BidService;
//# sourceMappingURL=bid.service.js.map