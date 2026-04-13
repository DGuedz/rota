"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RFQRepository = void 0;
const client_1 = require("@prisma/client");
class RFQRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRFQ(intentId, buyerAgentId, closesAt, payload) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Cria RFQ
            const rfq = await tx.rFQ.create({
                data: {
                    intentId,
                    buyerAgentId,
                    closesAt,
                    broadcastPayload: payload,
                    status: client_1.RFQStatus.OPEN
                }
            });
            // 2. Atualiza status da Intent
            await tx.intent.update({
                where: { id: intentId },
                data: { status: client_1.IntentStatus.QUOTED } // Or keeping OPEN, let's say QUOTED means RFQ open
            });
            return rfq;
        });
    }
    async findById(id) {
        return this.prisma.rFQ.findUnique({
            where: { id },
            include: {
                intent: true,
                bids: true
            }
        });
    }
    async expireRFQ(id) {
        return this.prisma.$transaction(async (tx) => {
            const rfq = await tx.rFQ.update({
                where: { id },
                data: { status: client_1.RFQStatus.EXPIRED }
            });
            await tx.intent.update({
                where: { id: rfq.intentId },
                data: { status: client_1.IntentStatus.EXPIRED }
            });
            return rfq;
        });
    }
    async awardRFQ(rfqId, bidId) {
        return this.prisma.$transaction(async (tx) => {
            const rfq = await tx.rFQ.update({
                where: { id: rfqId },
                data: {
                    status: client_1.RFQStatus.AWARDED,
                    awardedBidId: bidId
                },
                include: { intent: true }
            });
            await tx.bid.update({
                where: { id: bidId },
                data: { status: client_1.BidStatus.SELECTED }
            });
            await tx.intent.update({
                where: { id: rfq.intentId },
                data: {
                    status: client_1.IntentStatus.SELECTED,
                    selectedBidId: bidId
                }
            });
            return rfq;
        });
    }
}
exports.RFQRepository = RFQRepository;
//# sourceMappingURL=rfq.repository.js.map