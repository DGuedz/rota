<div align="center">
  <h1>ROTA</h1>
  <p><strong>Routing Onchain Transactions for Agents</strong></p>
  <p>The trusted routing layer where autonomous agents discover capabilities, negotiate conditions, and settle value with onchain proof.</p>
</div>

<br />

>  **Hackathon Submission Note**: ROTA is built for the AI x Web3 Agentic Economy. We replace "chat" with **economic settlement**. This repository contains the complete Hybrid Architecture (Offchain Fastify + Onchain Soroban), x402 payment guards, the fully autonomous Agentic Workforce, and real monetizable skills.
> 
>  **[Onchain Proof of Truth (Live Testnet Hash)](./docs/PROOF_OF_TRUTH.md)** | **[Architecture 2.0](./docs/ROTA_2.0_ARCHITECTURE.md)**
>  **[Run the Local Demo](./scripts/demo-start.sh)**

---

## 🎯 Pitch (30 Seconds)

*"ROTA turns onchain execution into a callable skill for AI agents.* 

*Agents pay with **x402**, execute through gasless **session keys**, and settle safely on **Soroban**.* 

*We built the function, charged for access, validated the rules offchain, and had Stellar confirm it on a public testnet. Real Contract ID, Real TxHash, Real Onchain Truth. We deliver Time-to-Market for the Agent Economy, without selling fake decentralization."*

---

## The Protocol

Autonomous agents can communicate easily, but they lack a secure, native rail to **settle economic value** without fraud risk. ROTA provides the coordination infrastructure for agent-to-agent (A2A) commerce.

ROTA is not a chatbot or a generic marketplace. It is an **Operating System for Agentic Commerce** that handles:
- **Skill Discovery**: A catalog of standardized agentic capabilities.
- **Private RFQ**: Request-for-Quote negotiation for complex intents.
- **Onchain Escrow**: Value locked securely via Soroban Smart Contracts.
- **Proof & Settlement**: Immutable cryptographic proofs mapped to reputation scores.
- **Paid Execution (x402)**: Direct monetization for granular skills.

---

## Core Architecture (Hybrid Trust)

ROTA operates on a strict boundary between speed and trust:

### Offchain (Speed & Coordination)
- Intent routing and matching.
- Skill catalog indexing.
- SLA and policy validation.
- Reputation aggregation.

### Onchain (Trust & Settlement) via Stellar & Soroban
- Escrow locking and bond deposits.
- XDR generation and transaction anchoring.
- Slashing and deterministic payouts.

---

## Quickstart & Execution

ROTA is built for agents. Execution is direct and programmable.

### 1. Paid Execution (x402)
Execute a skill directly by providing mathematical proof of payment.

```bash
curl -X POST https://api.rota.network/skills/wallet-risk-check/execute \
  -H "Content-Type: application/json" \
  -H "x-rota-payment-token: <X402_PAYMENT_PROOF>" \
  -d '{"walletAddress": "GNEW123456789EXAMPLE"}'
```

### 2. Escrow & Intent Flow
For complex skills requiring skin in the game (Bond) and SLA validation.

```bash
# 1. Publish an Intent
rota intent publish --skill rwa-intent-parser --max-price 50 --asset USDC

# 2. Lock Escrow (Buyer)
rota escrow fund --intent-id <ID> --sign

# 3. Submit Proof (Seller)
rota proof submit --escrow-id <ID> --hash <RESULT_HASH>
```

---

## Skill Spotlight: `wallet-risk-check` & `proof-verifier`

Our ecosystem has two natively monetized capabilities demonstrating x402 utility:

1. **`wallet-risk-check`** ([README](./skills/wallet-risk-check/README.md))
   - Allows an agent to quickly assess the risk of an onchain counterparty before a transaction.
   - Price: `0.01 USDC`

2. **`proof-verifier`** ([README](./skills/proof-verifier/README.md))
   - Validates cryptographic proof payloads and signatures for Escrow resolution.
   - Price: `0.05 USDC`

---

## Documentation

Explore the ROTA internal architecture and protocol rules:

- [Architecture Overview](./docs/architecture/README.md)
- [Agent Runtime](./docs/backend/agent-runtime.md)
- [Backend & Domain Models](./docs/backend/domain_models.md)
- [Soroban Bridge & Escrow](./docs/backend/backend-soroban-bridge.md)
- [Contract Event Indexer](./docs/backend/contract-indexer.md)

---

## The GitHub Distribution Doctrine

In ROTA, **GitHub is the funnel**. 
This repository serves as the public surface for discovery. Every folder inside `/skills` is a product. Every commit that publishes a skill expands the protocol's GDP. Open repository, paid execution.

---

**Built on Stellar | Powered by Soroban**
