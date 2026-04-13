#!/bin/bash

# Example execution of proof-verifier
curl -X POST http://localhost:8000/skills/proof-verifier/execute \
  -H "Content-Type: application/json" \
  -H "x-rota-payment-token: x402_mock_token_valid" \
  -d '{
    "proofPayload": "bWFnaWMgb2YgY3J5cHRv",
    "escrowId": "escrow_12345",
    "signatures": [
      {
        "signer": "G_SELLER_KEY_123",
        "signature": "mock_signature_long_enough_for_validation_123"
      }
    ]
  }'
