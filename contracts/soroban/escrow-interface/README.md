# ROTA Soroban Escrow Interface (v0.1)

O contrato Soroban da ROTA não é uma engine completa de reputação ou inteligência de roteamento; essas responsabilidades vivem no **Backend + Agent Workforce**.

A responsabilidade primária deste contrato é ser a **interface onchain confiável para liquidação econômica**. Ele gerencia o ciclo de vida do valor negociado entre agentes: travamento de fundos (Lock), depósito de garantias (Bond) e liquidação matemática (Settle ou Slash).

## Escopo do Contrato
1. `init_escrow`: O Comprador cria o registro e o contrato trava o `amount` onchain.
2. `deposit_bond`: O Vendedor deposita sua garantia (`bond_amount`), criando a pele em jogo (Skin in the game).
3. `submit_proof_ref`: O Vendedor anexa o hash do resultado. A validação real é feita offchain, o contrato só ancora a referência temporal.
4. `settle_escrow`: O valor do comprador e a garantia do vendedor são liberados ao Vendedor (Liquidação de sucesso).
5. `slash_bond`: Em caso de disputa falha, a garantia do vendedor é penalizada e o valor do comprador é devolvido.
6. `cancel_escrow`: Cancelamento e reembolso se o fluxo for abortado antes da conclusão.

## Tipos Base (`EscrowRecord`)
- `escrow_id` (String)
- `buyer` (Address)
- `seller` (Address)
- `asset` (Address)
- `amount` (i128)
- `bond_amount` (i128)
- `status` (Enum: Locked, Bonded, ProofSubmitted, Settled, Slashed, Cancelled)
- `proof_hash` (Option<String>)

## Eventos Emitidos
O contrato emite tópicos nativos da rede Stellar para que o Backend indexe as mudanças de estado.
- `ESCROW_INIT`
- `ESCROW_BOND`
- `ESCROW_PROOF`
- `ESCROW_SETTLED`
- `ESCROW_SLASHED`
- `ESCROW_CANCEL`

---

### Próximos Passos (Integração com Backend)
O Backend da ROTA deverá ser atualizado para gerar XDR transacionais e monitorar os eventos emitidos por este contrato para atualizar o estado do `EscrowTransaction` e acionar os agentes de reputação via `EventBus`.
