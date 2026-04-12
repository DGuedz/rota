"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventsIndexer = void 0;
const contract_events_mapper_1 = require("./contract-events.mapper");
class ContractEventsIndexer {
    prisma;
    stellarClient;
    reconciliationService;
    isPolling = false;
    timer = null;
    POLLING_INTERVAL = 5000; // 5 seconds
    BATCH_LIMIT = 50;
    constructor(prisma, stellarClient, reconciliationService) {
        this.prisma = prisma;
        this.stellarClient = stellarClient;
        this.reconciliationService = reconciliationService;
    }
    /**
     * Inicia o polling do indexador na testnet
     */
    start() {
        if (this.isPolling)
            return;
        this.isPolling = true;
        console.log(`[Indexer] Starting Soroban events polling for contract: ${this.stellarClient.contractId}`);
        this.timer = setInterval(() => {
            this.pollEvents().catch(err => console.error('[Indexer] Polling Error:', err));
        }, this.POLLING_INTERVAL);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isPolling = false;
    }
    async pollEvents() {
        // 1. Busca o checkpoint no banco para saber de onde continuar (Cursor ou Ledger)
        let checkpoint = await this.prisma.contractEventCheckpoint.findFirst({
            where: { contractId: this.stellarClient.contractId }
        });
        if (!checkpoint) {
            // Cria o primeiro se não existir
            checkpoint = await this.prisma.contractEventCheckpoint.create({
                data: {
                    contractId: this.stellarClient.contractId,
                    lastLedger: 0,
                }
            });
        }
        try {
            // 2. Consulta o RPC Soroban via SDK (getEvents)
            // Nota: o pacote StellarSdk tipa isso como getEvents() usando startLedger e pagination
            const requestConfig = {
                filters: [{
                        type: 'contract',
                        contractIds: [this.stellarClient.contractId]
                    }],
                limit: this.BATCH_LIMIT,
            };
            if (checkpoint.lastCursor) {
                requestConfig.cursor = checkpoint.lastCursor;
            }
            else if (checkpoint.lastLedger > 0) {
                requestConfig.startLedger = checkpoint.lastLedger;
            }
            else {
                // Fallback: se não tiver nada, pega do ledger atual (para evitar ler toda a testnet)
                const latestLedger = await this.stellarClient.server.getLatestLedger();
                requestConfig.startLedger = latestLedger.sequence;
            }
            const response = await this.stellarClient.server.getEvents(requestConfig);
            if (!response || !response.events || response.events.length === 0) {
                return; // Nada novo
            }
            // 3. Itera sobre cada evento cru
            let lastCursorProcessed = checkpoint.lastCursor;
            let lastLedgerProcessed = checkpoint.lastLedger;
            for (const rawEvent of response.events) {
                const domainEvent = contract_events_mapper_1.ContractEventsMapper.mapToDomain(rawEvent);
                if (domainEvent) {
                    // 4. Processa idempotente
                    await this.reconciliationService.processEvent(domainEvent);
                }
                // Atualiza cursores em memória
                lastCursorProcessed = rawEvent.id;
                lastLedgerProcessed = parseInt(rawEvent.ledger, 10);
            }
            // 5. Salva o checkpoint processado
            await this.prisma.contractEventCheckpoint.update({
                where: { id: checkpoint.id },
                data: {
                    lastCursor: lastCursorProcessed,
                    lastLedger: lastLedgerProcessed
                }
            });
        }
        catch (error) {
            console.error('[Indexer] Failed to fetch or process events from Soroban', error);
        }
    }
}
exports.ContractEventsIndexer = ContractEventsIndexer;
//# sourceMappingURL=contract-events.indexer.js.map