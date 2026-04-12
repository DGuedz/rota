# ROTA Architecture

A arquitetura do ROTA segue a regra: **Hybrid Onchain/Offchain**.

## O que é Onchain?
- **Soroban Smart Contracts**: Garantia (Escrow), Depósito de Bond, Slashing e Anchoring de Provas.
- **Stellar**: Liquidação final e agentic payments (x402/MPP).

## O que é Offchain?
- **ROTA API (Fastify)**: Discovery, RFQ Coordination, Quote Collection, Validação de SLA e cálculo de Score.
- **Armazenamento**: PostgreSQL (Dados Persistentes), Redis (Estado RFQ / Fila).

Toda a lógica offchain serve para acelerar a negociação antes de ancorar a liquidação onchain.
