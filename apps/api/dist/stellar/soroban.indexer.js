"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SorobanIndexer = void 0;
const stellar_client_1 = require("./stellar.client");
class SorobanIndexer {
    eventBus;
    isRunning = false;
    lastLedgerChecked = 0;
    cursor;
    intervalId;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Poll a cada 10 segundos
        this.intervalId = setInterval(() => this.pollEvents(), 10000);
        console.log('[SorobanIndexer] Started listening for escrow events on Testnet...');
    }
    stop() {
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.isRunning = false;
    }
    async pollEvents() {
        try {
            // Usar a API do RPC Server para pegar os eventos mais recentes
            // Filtramos pelo ID do contrato do nosso Escrow
            const requestParams = {
                filters: [
                    {
                        type: 'contract',
                        contractIds: [stellar_client_1.stellarClient.contractId],
                        topics: [] // Opcionalmente filtrar pelos tópicos
                    }
                ],
                limit: 100,
            };
            if (this.cursor) {
                requestParams.cursor = this.cursor;
            }
            else if (this.lastLedgerChecked > 0) {
                requestParams.startLedger = this.lastLedgerChecked;
            }
            else {
                // Se for a primeira vez, busca os últimos eventos pedindo pra rede o ledger mais recente
                const latestLedger = await stellar_client_1.stellarClient.server.getLatestLedger();
                this.lastLedgerChecked = latestLedger.sequence;
                requestParams.startLedger = this.lastLedgerChecked;
            }
            const eventsResponse = await stellar_client_1.stellarClient.server.getEvents(requestParams);
            if (!eventsResponse || !eventsResponse.events) {
                return;
            }
            for (const event of eventsResponse.events) {
                // Ignorar se não for do tipo contract
                if (event.type !== 'contract')
                    continue;
                this.cursor = event.id;
                // Tentar decodificar o tópico do evento
                const topicName = this.decodeTopicName(event.topic);
                if (topicName === 'escrow.settled' || topicName === 'escrow.slashed') {
                    console.log(`[SorobanIndexer] Detected ${topicName} event onchain! Emitting to EventBus...`);
                    await this.eventBus.publish('SMART_CONTRACT', topicName, {
                        contractId: stellar_client_1.stellarClient.contractId,
                        ledger: event.ledger,
                        txHash: event.txHash,
                        rawEvent: event,
                    });
                }
            }
        }
        catch (error) {
            console.error('[SorobanIndexer] Error polling events:', error);
        }
    }
    decodeTopicName(topics) {
        if (!topics || topics.length === 0)
            return null;
        try {
            // TODO: implementar scValToNative real do @stellar/stellar-sdk
            return 'escrow.settled';
        }
        catch (e) {
            return null;
        }
    }
}
exports.SorobanIndexer = SorobanIndexer;
//# sourceMappingURL=soroban.indexer.js.map