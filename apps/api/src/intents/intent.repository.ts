import { PrismaClient, IntentStatus } from '@prisma/client';

export class IntentRepository {
  constructor(private prisma: PrismaClient) {}

  async createIntent(data: {
    buyerAgentId: string;
    skillId?: string;
    title: string;
    description?: string;
    maxPrice?: number;
    preferredAssetCode?: string;
    preferredAssetIssuer?: string;
    requiredBond?: number;
    minReputation?: number;
    deadlineAt?: Date;
    validationCriteria?: any;
  }) {
    return this.prisma.intent.create({
      data: {
        ...data,
        status: IntentStatus.OPEN
      }
    });
  }

  async findById(id: string) {
    return this.prisma.intent.findUnique({
      where: { id },
      include: {
        buyerAgent: true,
        skill: true,
        rfq: true
      }
    });
  }

  async findAll() {
    return this.prisma.intent.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: IntentStatus) {
    return this.prisma.intent.update({
      where: { id },
      data: { status }
    });
  }
}
