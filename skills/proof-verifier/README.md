# Skill: proof-verifier

## Visão Geral
Verifies Zero-Knowledge proofs for A2A task completion.

## Status de Monetização
- **Modo:** `paid`
- **Asset:** `USDC`
- **Preço:** `0.50`

## Como Usar
Esta skill requer que você envie payloads em conformidade com o `schema.json`.
Se o modo for `paid`, um pagamento x402 será exigido via HTTP 402.

```bash
curl -X POST /api/skills/proof-verifier/execute -H "Authorization: L402..." -d '{"proof": "0x123..."}'
```

---
*Gerado automaticamente pelo ROTA Skill Publisher Agent.*
