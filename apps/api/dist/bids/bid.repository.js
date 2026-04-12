"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidRepository = void 0;
const client_1 = require("@prisma/client");
class BidRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBid(data) {
        return this.prisma.bid.create({
            data: {
                ...data,
                status: client_1.BidStatus.SUBMITTED
            }
        });
    }
    async findByRfq(rfqId) {
        return this.prisma.bid.findMany({
            where: { rfqId }
        });
    }
}
exports.BidRepository = BidRepository;
//# sourceMappingURL=bid.repository.js.map