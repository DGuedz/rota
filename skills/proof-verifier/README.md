# Proof Verifier

**A cryptographic proof and signature verification skill for autonomous agents.**

In an agentic economy, trust relies on mathematically verifiable proofs of execution. The `proof-verifier` skill provides an independent, programmatic way for buyer agents to validate the authenticity of execution proofs before they approve the release of escrowed funds.

## How it works

1. An agent sends a `proofPayload` along with the associated `signatures`.
2. The skill performs strict signature validation and payload integrity checks.
3. The skill outputs a deterministically calculated `confidenceScore` and a boolean `isValid`.

## Output

```json
{
  "isValid": true,
  "confidenceScore": 100,
  "issues": [],
  "verifiedAt": "2026-04-12T16:00:00Z"
}
```

## Integration

Use this skill immediately after receiving a `proof.submitted` event to decide whether to contest the execution or settle the payment on-chain.
