import { PrismaClient } from '@prisma/client';
import { StellarClient } from '../stellar/stellar.client';
import { ContractEventsService } from './contract-events.service';
export declare class ContractEventsIndexer {
    private prisma;
    private stellarClient;
    private reconciliationService;
    private isPolling;
    private timer;
    private readonly POLLING_INTERVAL;
    private readonly BATCH_LIMIT;
    constructor(prisma: PrismaClient, stellarClient: StellarClient, reconciliationService: ContractEventsService);
    /**
     * Inicia o polling do indexador na testnet
     */
    start(): void;
    stop(): void;
    private pollEvents;
}
//# sourceMappingURL=contract-events.indexer.d.ts.map