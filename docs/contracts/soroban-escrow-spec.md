# Soroban Escrow Specification (VSC Compliant)

## 1. Visão Geral (Overview)
Este documento define o plano de refatoração do contrato inteligente `RotaEscrowContract` na rede Soroban. O objetivo é remover centralizações (ex: uso genérico de `admin`), aplicar rigorosamente as regras **VSC (Economy-First / On-Chain)**, garantir liquidação atômica e introduzir resiliência operacional e defesa ativa (Honeypots).

## 2. Refinamento da Máquina de Estados (State Machine)
Atualmente, o contrato suporta: `Locked` -> `Bonded` -> `ProofSubmitted` -> `Settled` | `Slashed` | `Cancelled`.

**Novas transições necessárias:**
- **Time-locks**: A transição de `ProofSubmitted` para `Settled` deve permitir uma liquidação automática (Auto-Settle) se o comprador não abrir disputa dentro de um prazo `dispute_window` (ex: 24 horas).
- **Disputa Explícita**: `ProofSubmitted` -> `Disputed`. Apenas o comprador pode acionar `raise_dispute`, o que pausa o auto-settle e exige resolução por um oráculo/árbitro (o Agente de Reputação/Resolução).

## 3. Autorização e Descentralização (VSC Rule 2)
Atualmente as funções `settle_escrow`, `slash_bond` e `cancel_escrow` usam um `admin` genérico. 
**Plano de Refatoração:**
- O `init_escrow` deve registrar um `oracle` ou `resolver` (o endereço do backend/agente que tem autoridade para resolver disputas).
- `settle_escrow` deve ser chamado pelo **Comprador (Buyer)** (liquidação feliz) ou pelo **Oráculo** (após o timeout ou disputa resolvida).
- `slash_bond` deve ser chamado **apenas pelo Oráculo**, nunca pelo comprador (evitando abuso).

## 4. Defesa Ativa / Honeypot (VSC Rule 7)
Implementar entidades isca no contrato.
**Plano de Refatoração:**
- Adicionar uma função `admin_drain_all(env: Env, token: Address)` que **aparenta** ser uma falha de segurança deixada pelos desenvolvedores.
- Se qualquer endereço tentar chamar esta função, a transação **não transfere fundos**, mas sim:
  1. Emite o evento `SECURITY_INTRUSION_DETECTED` com o endereço do atacante.
  2. Adiciona o atacante a um `blacklist` no storage do contrato (se aplicável), bloqueando interações futuras desse endereço no ROTA.
- **Integração Off-chain**: O `ContractEventsIndexer` irá capturar este evento e repassar ao `protocol-watcher-agent`, que classificará como `CRITICAL` e engatilhará defesas no backend.

## 5. Assinatura e Eventos Econômicos (VSC Rule 8)
Nenhum dado desnecessário no payload.
- Os eventos emitidos (`emit_escrow_settled`, `emit_bond_slashed`) devem conter estritamente: `escrow_id`, hashes de transação e status.
- Qualquer dado de texto ou intenção fica no IPFS/PostgreSQL (off-chain), referenciado no contrato apenas via `metadata_hash`.

## 6. Cronograma de Implementação (Action Plan)

### Fase 1: Ajuste de Storage e Tipos (`types.rs` e `storage.rs`)
- [ ] Adicionar `resolver: Address` e `dispute_deadline: u64` no `EscrowRecord`.
- [ ] Atualizar `DataKey` para suportar `Blacklist(Address)`.

### Fase 2: Lógica de Time-lock e Oráculo (`lib.rs`)
- [ ] Atualizar `init_escrow` para aceitar o `resolver` e definir o `dispute_deadline`.
- [ ] Atualizar `settle_escrow` para verificar `buyer.require_auth()` OR (`resolver.require_auth()` AND `env.ledger().timestamp() > record.dispute_deadline`).

### Fase 3: Honeypot (`lib.rs` e `events.rs`)
- [ ] Criar função `emergency_withdraw_yield` (Honeypot).
- [ ] Criar `emit_intrusion_detected(attacker: Address)`.

### Fase 4: Integração Off-chain
- [ ] Atualizar o Indexador no Node.js para ouvir os novos eventos e despachar para o EventBus.

---
*Este plano garante que a ROTA seja uma infraestrutura *trustless* onde o código on-chain e os agentes off-chain se complementam sem comprometer o isolamento de risco.*
