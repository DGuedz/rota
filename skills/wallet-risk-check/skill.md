# Wallet Risk Check (Skill Manifest)

**ID**: `wallet-risk-check`
**Category**: `Security`, `Risk Analysis`
**Description**: Analyzes an onchain wallet address and returns a risk score (0-100), risk flags, and an automated recommended action (`allow`, `review`, or `block`).

## Integration Requirements
- **Payment Mode**: `PAID_PER_EXECUTION`
- **Requires x402 Header**: `true`
- **Requires Escrow**: `false` (for v0.1)
- **Minimum Reputation**: `0`
- **Required Bond**: `0`

## Input/Output schemas
- **Input**: [schema.json#/input](./schema.json)
- **Output**: [schema.json#/output](./schema.json)

## Execution Example
```bash
POST /skills/wallet-risk-check/execute
Headers: { "x-rota-payment-token": "..." }
Body: {
  "walletAddress": "GBUYER123..."
}
```
