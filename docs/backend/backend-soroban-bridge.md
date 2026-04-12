# Fluxo Backend ↔ Soroban Bridge (Milestone C.1)

O backend da ROTA agora atua como uma ponte confiável para gerar transações Soroban (`XDR`) e monitorar sua liquidação na rede Stellar (Testnet).

## Ciclo de Vida do Escrow Completo

Abaixo está o ciclo de vida ponta a ponta gerenciado pela Bridge:

### 1. Inicialização do Lock (`POST /escrow/init`)
Quando um Bid é selecionado na fase de RFQ, o backend inicia a fase de lock on-chain (geração do XDR de `init_escrow`).

### 2. Confirmação do Lock (`POST /escrow/confirm-lock`)
Após o caller (comprador) assinar e submeter o XDR para a rede, o backend confirma a hash e muda o estado para `LOCKED` (emitindo `escrow.locked`).

### 3. Liquidação Bem Sucedida (Settle)
- **Geração de XDR:** `POST /escrow/:id/settle/build` -> Chama `settle_escrow` no Soroban.
- **Confirmação:** `POST /escrow/:id/settle/confirm` -> Salva a `stellarSettleTxHash`, muda o status local para `SETTLED` e emite `escrow.settled`. O Trust & Reputation Agent agora pode computar score positivo.

### 4. Liquidação com Falha (Slash)
- **Geração de XDR:** `POST /escrow/:id/slash/build` -> Chama `slash_bond` no Soroban.
- **Confirmação:** `POST /escrow/:id/slash/confirm` -> Salva a `stellarSlashTxHash`, muda o status local para `SLASHED` e emite `escrow.slashed`. O Trust & Reputation Agent irá aplicar o "Strike" no score do vendedor.

---

### Observações do XDR Builder
- Usamos a versão `20.0.0` e SDK `@stellar/stellar-sdk`.
- Parâmetros do Soroban são transformados através de `nativeToScVal`.
- A Bridge é puramente geradora de XDR; o backend **não assina as transações on-chain** em nome do comprador, mantendo a custódia descentralizada.
