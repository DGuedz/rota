import { RotaEventBus } from '../events/event-bus';
export declare class SorobanIndexer {
    private eventBus;
    private isRunning;
    private lastLedgerChecked;
    private cursor?;
    private intervalId?;
    private stellarClient;
    constructor(eventBus: RotaEventBus);
    start(): void;
    stop(): void;
    private pollEvents;
    private decodeTopicName;
}
//# sourceMappingURL=soroban.indexer.d.ts.map