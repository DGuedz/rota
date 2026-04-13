# ROTA Core Development Standards

1. **Economy-First (VSC Rules):** Security, cost, and atomic settlement precede convenience. Optimize for integrity. Never expose private keys (use KMS/env only).
2. **Token Discipline (Zero-Emoji):** NEVER use emojis or decorative unicode in code, docs, or terminal output. Maximize LLM context window efficiency and minimize token costs.
3. **Hybrid Trust Architecture:** 
   - *Offchain (Fastify, BullMQ, Prisma):* Speed, routing, reputation, x402 payment validation, and coordination.
   - *Onchain (Stellar, Soroban Rust):* Escrow locks, bonds, slashing, and cryptographic proof anchoring.
4. **Atomic Settlement:** Financial execution must be deterministic. No offchain promises. If it involves funds, it requires cryptographic proof.
5. **Resilience:** Use BullMQ for event queues. Implement strict idempotency. No event can be lost. Failures must not cascade.
6. **Execution Style:** Write explicit, modular, cost-aware code. Avoid speculative abstractions.