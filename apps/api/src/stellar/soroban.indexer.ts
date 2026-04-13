import { StellarClient } from './stellar.client';
import { RotaEventBus } from '../events/event-bus';
import * as StellarSdk from '@stellar/stellar-sdk';

export class SorobanIndexer {
  private isRunning = false;
  private lastLedgerChecked = 0;
  private cursor?: string;
  private intervalId?: NodeJS.Timeout;
  private stellarClient: StellarClient;

  constructor(private eventBus: RotaEventBus) {
    this.stellarClient = new StellarClient();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Poll a cada 10 segundos
    this.intervalId = setInterval(() => this.pollEvents(), 10000);
    console.log('[SorobanIndexer] Started listening for escrow events on Testnet...');
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isRunning = false;
  }

  private async pollEvents() {
    try {
      // Usar a API do RPC Server para pegar os eventos mais recentes
      // Filtramos pelo ID do contrato do nosso Escrow
      const requestParams: any = {
        filters: [
          {
            type: 'contract',
            contractIds: [this.stellarClient.contractId],
            topics: [] // Opcionalmente filtrar pelos tópicos
          }
        ],
        limit: 100,
      };

      if (this.cursor) {
        requestParams.cursor = this.cursor;
      } else if (this.lastLedgerChecked > 0) {
        requestParams.startLedger = this.lastLedgerChecked;
      } else {
        // Se for a primeira vez, busca os últimos eventos pedindo pra rede o ledger mais recente
        const latestLedger = await this.stellarClient.server.getLatestLedger();
        this.lastLedgerChecked = latestLedger.sequence;
        requestParams.startLedger = this.lastLedgerChecked;
      }

      const eventsResponse = await this.stellarClient.server.getEvents(requestParams);

      if (!eventsResponse || !eventsResponse.events) {
        return;
      }

      for (const event of eventsResponse.events) {
        // Ignorar se não for do tipo contract
        if (event.type !== 'contract') continue;

        this.cursor = event.id;

        // Tentar decodificar o tópico do evento
        const topicName = this.decodeTopicName(event.topic);
        
        if (topicName) {
          console.log(`[SorobanIndexer] Detected ${topicName} event onchain! Emitting to EventBus...`);
          
          await this.eventBus.publish(
            'SMART_CONTRACT' as any,
            topicName,
            {
              contractId: this.stellarClient.contractId,
              ledger: event.ledger,
              txHash: event.txHash,
              rawEvent: event,
            }
          );
        }
      }
    } catch (error) {
      console.error('[SorobanIndexer] Error polling events:', error);
    }
  }

  private decodeTopicName(topics: any[]): string | null {
    if (!topics || topics.length < 2) return null; // Espera pelo menos o TOPIC_ESCROW e o tipo de evento

    try {
      // O primeiro tópico é geralmente o "contrato" ou "domínio" (ex: ESCROW)
      const domainScVal = StellarSdk.xdr.ScVal.fromXDR(topics[0], 'base64');
      const domain = StellarSdk.scValToNative(domainScVal);

      // O segundo tópico é o nome específico do evento (ex: INIT, SETTLED)
      const eventScVal = StellarSdk.xdr.ScVal.fromXDR(topics[1], 'base64');
      const eventName = StellarSdk.scValToNative(eventScVal);

      if (domain === 'ESCROW') {
        switch (eventName) {
          case 'INIT': return 'escrow.initialized';
          case 'BOND': return 'escrow.bonded';
          case 'PROOF': return 'escrow.proof_submitted';
          case 'SETTLED': return 'escrow.settled';
          case 'SLASHED': return 'escrow.slashed';
          case 'CANCEL': return 'escrow.cancelled';
          case 'DISPUTED': return 'escrow.disputed';
          default: return `escrow.${eventName.toLowerCase()}`;
        }
      } else if (domain === 'SECURITY' && eventName === 'INTRUSION') {
        return 'security.intrusion_detected';
      }

      return null;
    } catch (e) {
      console.error('[SorobanIndexer] Error decoding event topics:', e);
      return null;
    }
  }
}
