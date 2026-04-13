# ROTA Contract Event Indexer (Milestone C.3)

O Indexer é o componente responsável por ouvir a testnet da Stellar e garantir que o estado local do backend da ROTA convirja com a verdade absoluta *on-chain* (Smart Contract Escrow).

## Arquitetura
Ele é composto por 3 engrenagens principais:

### 1. `ContractEventsIndexer` (O Poller)
Um cronjob em memória que consulta o Soroban RPC (`getEvents`) a cada 5 segundos. 
- **Checkpointing:** Ele salva o último `ledger` e o último `cursor` (ID do evento) no banco (tabela `ContractEventCheckpoint`). Se o servidor cair e voltar, ele não reprocessa o histórico inteiro.

### 2. `ContractEventsMapper` (O Tradutor)
Eventos no Soroban são XDR puros (ScVal). O mapper traduz os tópicos e valores para um formato compreensível pelo domínio da ROTA:
- `INIT` -> `escrow.locked`
- `BOND` -> `escrow.bonded`
- `SETTLED` -> `escrow.settled`
- etc.

### 3. `ContractEventsService` (O Reconciliador)
Aplica as mudanças de estado no Postgres de forma **idempotente**. 
Se o indexer pegar o mesmo evento duas vezes, ou se o status local já estiver mais avançado, ele pula a transação. Caso contrário, atualiza a tabela `EscrowTransaction` e **cospe o evento** para o `EventBus` interno.

## O Impacto
Ao plugar esse indexador no `server.ts`, nós fechamos o loop do protocolo:
1. Agent submete XDR.
2. Transação é confirmada na testnet.
3. Soroban emite evento.
4. Indexer capta evento, atualiza o DB e dispara notificação no barramento.
5. `Trust & Reputation Agent` recebe a notificação e atualiza a reputação dos agentes envolvidos!
