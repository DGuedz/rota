import { PrismaClient, EscrowStatus, EventSource } from '@prisma/client';
import { RotaEventBus } from '../events/event-bus';
import { NormalizedDomainEvent } from './contract-events.types';

export class ContractEventsService {
  constructor(
    private prisma: PrismaClient,
    private eventBus: RotaEventBus
  ) {}

  /**
   * Processa o evento on-chain de forma idempotente.
   * Se o banco estiver desatualizado, ele força a conciliação (Soroban como fonte da verdade).
   */
  async processEvent(event: NormalizedDomainEvent) {
    try {
      const escrowId = event.escrowId;
      
      // Busca no banco local
      const localEscrow = await this.prisma.escrowTransaction.findUnique({
        where: { id: escrowId }
      });

      if (!localEscrow) {
        console.warn(`[Indexer] Escrow ${escrowId} not found locally. Ignoring event.`);
        return;
      }

      // Reconciliação: Evita processar eventos repetidos (idempotência baseada no cursor/hash)
      // Como o indexer processa ordenado, assumimos que se o status for igual ou mais avançado, pulamos.
      if (this.isAlreadyProcessed(localEscrow.status, event.targetStatus)) {
        console.log(`[Indexer] Escrow ${escrowId} already in status ${localEscrow.status}. Skipping.`);
        return;
      }

      console.log(`[Indexer] Reconciling Escrow ${escrowId}: ${localEscrow.status} -> ${event.targetStatus}`);

      // Transação atômica para atualizar a base e registrar no EventBus interno
      await this.prisma.$transaction(async (tx) => {
        
        // 1. Atualiza a verdade local
        await tx.escrowTransaction.update({
          where: { id: escrowId },
          data: {
            status: event.targetStatus,
            // Atualizamos a hash onchain de acordo com o estágio
            stellarLockTxHash: event.targetStatus === EscrowStatus.LOCKED ? event.txHash : undefined,
            stellarSettleTxHash: event.targetStatus === EscrowStatus.SETTLED ? event.txHash : undefined,
            stellarSlashTxHash: event.targetStatus === EscrowStatus.SLASHED ? event.txHash : undefined,
          }
        });

        // 2. Cria o log de execução do Agente ou Protocolo (se aplicável)
        // Isso alimentará a UI e o log auditável da ROTA

      });

      // 3. Publica no EventBus (Fora da transação do Prisma, caso usemos fila externa no futuro)
      await this.eventBus.publish(
        'PROTOCOL' as EventSource,
        event.domainEventType,
        {
          escrowTxId: escrowId,
          intentId: localEscrow.intentId,
          payload: event.payload,
          ledger: event.ledger,
          txHash: event.txHash,
          cursor: event.cursor
        }
      );

    } catch (error) {
      console.error(`[Indexer] Failed to process event for escrow ${event.escrowId}`, error);
      throw error;
    }
  }

  /**
   * Helper simplificado de estado para evitar re-processamento do mesmo evento Soroban.
   * Em produção, isso usaria uma máquina de estados finita (FSM).
   */
  private isAlreadyProcessed(currentStatus: EscrowStatus, incomingStatus: EscrowStatus): boolean {
    if (currentStatus === incomingStatus) return true;
    
    // Regras rígidas: Se já liquidou (Settled/Slashed), não pode voltar pra Locked/Bonded
    const terminalStates = [EscrowStatus.SETTLED, EscrowStatus.SLASHED, EscrowStatus.CANCELLED];
    if (terminalStates.includes(currentStatus)) return true;

    return false;
  }
}
