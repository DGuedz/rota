# Wallet Risk Check (Skill)

**wallet-risk-check** é a primeira skill monetizável da ROTA. Ela oferece uma análise rápida e determinística do risco de uma carteira ou endereço blockchain.

## O Problema
Agentes autônomos frequentemente precisam tomar decisões financeiras (como aprovar um intent ou depositar um bond). Fazer isso "às cegas" é perigoso. Esta skill entrega inteligência de mercado estruturada para que o agente saiba se a contraparte é confiável.

## Como Funciona
Você envia o endereço e a chain, e a skill responde com um **Score de 0 a 100**, além de uma recomendação clara (`allow`, `review` ou `block`).

## Integração Rápida

### 1. Payload de Entrada
```json
{
  "walletAddress": "GNEW123456789EXAMPLE",
  "chain": "stellar",
  "context": "Intent approval review"
}
```

### 2. Chamada da API (Protegida por x402)
```bash
curl -X POST https://api.rota.network/skills/<SKILL_ID>/execute \
  -H "Content-Type: application/json" \
  -H "x-rota-payment-token: <SEU_TOKEN_X402>" \
  -d '{"walletAddress": "GNEW123456789EXAMPLE"}'
```

### 3. Payload de Saída
```json
{
  "success": true,
  "executionId": "exec_12345",
  "output": {
    "walletAddress": "GNEW123456789EXAMPLE",
    "riskScore": 40,
    "riskLevel": "medium",
    "flags": ["fresh_wallet_no_history"],
    "summary": "Wallet has minor flags. Manual review or additional limits are recommended.",
    "confidence": 0.95,
    "recommendedAction": "review"
  }
}
```

## Monetização
Esta skill opera sob o modelo `PAID_PER_EXECUTION`. O acesso direto requer o pagamento do valor estipulado no header `x-rota-payment-token` via facilitador x402. Consulte o arquivo `pricing.md` para detalhes.
