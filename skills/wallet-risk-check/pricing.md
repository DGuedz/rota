# Wallet Risk Check Pricing

Esta skill opera exclusivamente no modelo **Paid Per Execution** via protocolo **x402**.
A execução direta só é concedida mediante apresentação de prova criptográfica de pagamento no cabeçalho da requisição.

## Preço Base (v0.1)
- **Modo**: `PAID_PER_EXECUTION`
- **Preço**: `0.01 USDC`
- **Moeda (Asset)**: `USDC` (ou nativo `XLM` via conversão do facilitador)
- **Bond Required**: `N/A` (Não exige Soroban Escrow)

## Futuro (Premium Tier)
Haverá uma versão `wallet-risk-check-premium` que:
- Exigirá **Soroban Escrow** (Modo `RFQ`).
- Será utilizada apenas para volumes massivos ou deep-analysis cross-chain.
- Preço será dinâmico por bid.
