import { PrismaClient, IntentStatus } from '@prisma/client';
export declare class IntentRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    createIntent(data: {
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
    }): Promise<any>;
    findById(id: string): Promise<any>;
    findAll(): Promise<any>;
    updateStatus(id: string, status: IntentStatus): Promise<any>;
}
//# sourceMappingURL=intent.repository.d.ts.map