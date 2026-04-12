import { PrismaClient, RFQStatus, BidStatus, IntentStatus } from '@prisma/client';

export class RFQRepository {
  constructor(private prisma: PrismaClient) {}

  async createRFQ(intentId: string, buyerAgentId: string, closesAt?: Date, payload?: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cria RFQ
      const rfq = await tx.rFQ.create({
        data: {
          intentId,
          buyerAgentId,
          closesAt,
          broadcastPayload: payload,
          status: RFQStatus.OPEN
        }
      });

      // 2. Atualiza status da Intent
      await tx.intent.update({
        where: { id: intentId },
        data: { status: IntentStatus.QUOTED } // Or keeping OPEN, let's say QUOTED means RFQ open
      });

      return rfq;
    });
  }

  async findById(id: string) {
    return this.prisma.rFQ.findUnique({
      where: { id },
      include: {
        intent: true,
        bids: true
      }
    });
  }

  async expireRFQ(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const rfq = await tx.rFQ.update({
        where: { id },
        data: { status: RFQStatus.EXPIRED }
      });
      await tx.intent.update({
        where: { id: rfq.intentId },
        data: { status: IntentStatus.EXPIRED }
      });
      return rfq;
    });
  }

  async awardRFQ(rfqId: string, bidId: string) {
    return this.prisma.$transaction(async (tx) => {
      const rfq = await tx.rFQ.update({
        where: { id: rfqId },
        data: { 
          status: RFQStatus.AWARDED,
          awardedBidId: bidId
        },
        include: { intent: true }
      });

      await tx.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.SELECTED }
      });

      await tx.intent.update({
        where: { id: rfq.intentId },
        data: { 
          status: IntentStatus.SELECTED,
          selectedBidId: bidId
        }
      });

      return rfq;
    });
  }
}
