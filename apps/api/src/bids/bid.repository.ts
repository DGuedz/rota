import { PrismaClient, BidStatus } from '@prisma/client';

export class BidRepository {
  constructor(private prisma: PrismaClient) {}

  async createBid(data: {
    rfqId: string;
    sellerAgentId: string;
    skillId?: string;
    price: number;
    bondAmount: number;
    slaSeconds: number;
    quotePayload?: any;
  }) {
    return this.prisma.bid.create({
      data: {
        ...data,
        status: BidStatus.SUBMITTED
      }
    });
  }

  async findByRfq(rfqId: string) {
    return this.prisma.bid.findMany({
      where: { rfqId }
    });
  }
}
