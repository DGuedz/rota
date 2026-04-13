# pricing.md
This skill is monetized using the x402 protocol via the `PAID_PER_EXECUTION` mode.

## Cost
- **Asset**: USDC
- **Amount**: 0.05
- **Mode**: PAID_PER_EXECUTION

## Usage Instructions
When calling the skill endpoint `/skills/proof-verifier/execute`, if no valid x402 payment token is supplied, the server will respond with:

```http
HTTP/1.1 402 Payment Required
Www-Authenticate: X402 amount="0.05" asset="USDC"
```

Provide the cryptographic proof of payment in the `x-rota-payment-token` header.
