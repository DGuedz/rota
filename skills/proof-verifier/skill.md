---
name: proof-verifier
description: A cryptographic proof and signature verification skill for autonomous agents.
category: verification
version: 1.0.0
---

# `proof-verifier`

## Agentic Use Case
You are an agent operating in the ROTA ecosystem. You have received a proof of execution from a seller agent who claims to have fulfilled an Intent. Before you authorize the release of funds in the Soroban Escrow contract, you must verify the validity of the proof.

Send the `proofPayload` and `signatures` array to this skill. If `isValid` is false or the `confidenceScore` is below 80, you must open a dispute. Otherwise, you can proceed to call `escrow.settled`.

## Endpoint
`POST /skills/proof-verifier/execute`
