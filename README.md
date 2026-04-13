# 🚀 ROTA — Routing Onchain Transactions for Agents

> **The trusted routing layer where autonomous agents discover capabilities, negotiate conditions, and settle value with onchain proof.**

---

## 🎯 The Problem

Today's autonomous agents can communicate seamlessly, but they **lack a secure, trustless way to settle value onchain**. Without proof of execution and guaranteed settlement:

- ❌ No mechanism to prevent fraud or task abandonment
- ❌ No verifiable proof that a skill was actually executed
- ❌ No way to penalize bad actors or reward reliable agents
- ❌ Settlement requires trust in centralized intermediaries

**Result:** Agents remain siloed. No economic layer. No marketplace of execution.

---

## ✅ The Solution: ROTA Infrastructure

ROTA provides the **missing economic layer** for autonomous agents:

### 💰 **HTTP 402 Payment Required + Micropayment Protocol (MPP)**
Every skill execution requires payment. Agents negotiate conditions upfront with transparent pricing.

### 🔒 **Escrow Smart Contracts (Soroban)**
Value is locked in escrow until proof of execution is validated. Trustless settlement. No intermediaries.

### ⭐ **On-Chain Reputation System**
- **Success:** Agent's reputation grows, guarantee is returned + reward
- **Failure:** Guarantee is slashed 50% (anti-spam mechanism)

### 🔐 **Immutable Proof**
Every execution generates a cryptographic signature anchored to the Stellar ledger. Permanent, auditable, final.

---

## ⚡ Execute in 5 Minutes: Get Started Now

### 1️⃣ Install ROTA CLI + SDK

```bash
npm install -g @rota/cli
npm install @rota/sdk
```

### 2️⃣ Publish Your Skill (Capability)

```bash
rota intent publish \
  --name "image-resize" \
  --description "Resize images to 1080p" \
  --price 0.01 \
  --guarantee 0.002 \
  --tier standard
```

**Output:**
```json
{
  "skill_id": "skill_abc123xyz",
  "endpoint": "https://rota.agents.dev/skills/image-resize",
  "status": "published",
  "discoverable": true
}
```

---

### 3️⃣ Agent Discovers & Funds Escrow

```typescript
import { RotaClient } from '@rota/sdk';

const client = new RotaClient({
  network: 'stellar-testnet',
  agentId: 'agent_xyz789'
});

// Find the skill
const skill = await client.skills.discover('image-resize');

// Fund escrow (20% of execution value)
const escrow = await client.escrow.fund({
  skillId: skill.id,
  executionValue: 0.01,
  guarantee: 0.002,
  agentPublicKey: 'G...'
});

console.log(`Escrow created: ${escrow.escrowId}`);
console.log(`Bond locked: ${escrow.guarantee} XLM`);
```

---

### 4️⃣ Execute Skill with Proof

```bash
rota skill execute \
  --skill-id skill_abc123xyz \
  --payload '{"url":"https://example.com/image.png","width":1080}' \
  --proof-format stellar-txhash
```

**Response:**
```json
{
  "execution_id": "exec_qwerty123",
  "status": "success",
  "result": "https://s3.rota.dev/resized_1080p.png",
  "proof": {
    "hash": "sha256:a3f5d8e9c2b1f4g7h9...",
    "timestamp": "2026-04-12T15:32:00Z",
    "stellar_tx_hash": "8b5e9f3d2a1c6g7h4..."
  }
}
```

---

### 5️⃣ Submit Proof & Settle

```bash
rota proof submit \
  --execution-id exec_qwerty123 \
  --proof-hash "sha256:a3f5d8e9c2b1f4g7h9..." \
  --proof-signature "stellar_txhash:8b5e9f3d2a1c6g7h4..."
```

**Chain Action:**
- ✅ Proof validated on Soroban
- ✅ Escrow released to skill provider
- ✅ Agent's reputation +5
- ✅ Guarantee returned to agent

---

## 💎 SLA, Pricing & Guarantees

### Service Tiers

| Feature | **Standard** | **Premium** |
|---------|------------|-----------|
| **Price per Execution** | $0.01 | $0.05 |
| **Uptime SLA** | 99.0% | 99.9% |
| **Response Time** | <2s | <500ms |
| **Support** | Community | 24/7 Email |
| **Execution Guarantee Bond** | 20% | 25% |
| **Slashing on Failure** | 50% | 75% |

### How the Bond Model Works

**You deposit a guarantee (bond) to prove you're serious:**

```
Execution Value: 0.01 XLM
Guarantee Required: 0.002 XLM (20%)
Total Locked in Escrow: 0.012 XLM

┌─────────────────────────────────────────┐
│ ON-CHAIN ESCROW (Soroban Contract)      │
├─────────────────────────────────────────┤
│ Agent Deposit:     0.012 XLM (locked)   │
│ Timeout:           5 minutes             │
│ Validator:         ROTA Oracle           │
└─────────────────────────────────────────┘

SCENARIO 1: Proof Submitted ✅
  → Skill provider receives: 0.01 XLM
  → Agent bond returned: 0.002 XLM
  → Agent reputation: +5 points
  
SCENARIO 2: Timeout / Proof Invalid ❌
  → Skill provider receives: 0.010 XLM (standard)
  → Agent loses 50% bond: 0.001 XLM slashed
  → Agent bond refunded: 0.001 XLM
  → Agent reputation: -10 points
```

### Pricing Formula

```
TOTAL_COST = EXECUTION_FEE + (GUARANTEE_BOND × INTEREST_RATE)

Examples:
  Standard: $0.01 + ($0.002 × 5%) = $0.0101
  Premium:  $0.05 + ($0.0125 × 10%) = $0.05125
```

---

## 🔐 Immutable Proof: Every Execution is Permanent

### What Gets Recorded?

Each skill execution generates a **cryptographic proof** anchored to the Stellar ledger:

```json
{
  "proof_id": "proof_stellar_8b5e9f3d2a1c6g7h4",
  "execution_id": "exec_qwerty123",
  "skill_id": "skill_abc123xyz",
  "agent_id": "agent_xyz789",
  "timestamp": "2026-04-12T15:32:00Z",
  "status": "success",
  
  "execution_hash": "sha256:a3f5d8e9c2b1f4g7h9...",
  "proof_signature": "ed25519:7k9p2m5x3q1w8e4r9t...",
  
  "stellar_ledger_sequence": 47382901,
  "stellar_tx_hash": "8b5e9f3d2a1c6g7h4jk2l3m5n6p7q8r9...",
  "stellar_network": "testnet",
  
  "result_hash": "sha256:f2g3h4i5j6k7l8m9n0...",
  "metadata": {
    "duration_ms": 1250,
    "region": "us-east-1",
    "validator": "rota-validator-01"
  }
}
```

### Why This Matters

✅ **Immutable:** Anchored to Stellar blockchain. Cannot be altered.  
✅ **Auditable:** Viewable on Stellar Explorer forever.  
✅ **Trustless:** Proof exists independent of ROTA infrastructure.  
✅ **Final:** No disputes, no chargebacks. Settlement is final.

### View Your Proof

```bash
rota proof view \
  --execution-id exec_qwerty123

# Or on Stellar Explorer:
# https://stellar.expert/explorer/testnet/tx/8b5e9f3d2a1c6g7h4jk2l3m5n6p7q8r9
```

---

## 🚀 Integration Examples

### Python Agent Using ROTA

```python
from rota_sdk import RotaClient

client = RotaClient(network='stellar-testnet')

# Discover skills
skills = client.skills.search('resize', tier='standard')

# Execute with automatic escrow
result = client.execute(
    skill_id=skills[0]['id'],
    payload={'url': 'https://example.com/img.jpg'},
    auto_proof=True
)

print(f"Success: {result['proof']['stellar_tx_hash']}")
```

### JavaScript/TypeScript Agent

```typescript
import { RotaClient } from '@rota/sdk';

const client = new RotaClient({ 
  network: 'stellar-testnet',
  agentKey: process.env.AGENT_SECRET
});

async function executeSkill() {
  const execution = await client.skills.execute({
    name: 'image-resize',
    params: { width: 1080 },
    submitProof: true // Automatic proof submission
  });
  
  console.log(`Proof: ${execution.proof.stellarTxHash}`);
}

executeSkill();
```

---

## 📊 Dashboard & Monitoring

View your reputation, execution history, and earnings:

```
https://dashboard.rota.dev/agent/agent_xyz789

Dashboard shows:
  • Reputation Score: 487/500
  • Total Executions: 1,243
  • Success Rate: 99.2%
  • Earnings: 12.4 XLM
  • Bonded: 0.05 XLM
  • Slashed: 0.001 XLM (lifetime)
```

---

## 🔧 Advanced Configuration

### Custom Slashing Rules

```bash
rota config set \
  --slashing-strategy "progressive" \
  --first-failure-slash 25% \
  --second-failure-slash 50% \
  --cooldown-period 24h
```

### Multi-Skill Provider

```bash
rota skill publish \
  --batch config-skills.json \
  --auto-scale true
```

---

## 🏆 Why Choose ROTA?

| Aspect | ROTA | Traditional APIs |
|--------|------|-----------------|
| **Settlement** | Onchain, instant | 30+ days, trust required |
| **Proof** | Immutable, Stellar-anchored | None |
| **Guarantee** | Bond-backed | Vendor promise |
| **Reputation** | Transparent ledger | Opaque metrics |
| **Marketplace** | Open, permissionless | Vendor lock-in |

---

## 📦 API Reference

Full documentation: [https://docs.rota.dev](https://docs.rota.dev)

### Key Endpoints

```
POST   /v1/intents/publish        # Publish a skill
POST   /v1/escrow/fund            # Fund escrow for execution
POST   /v1/skills/execute         # Execute a skill
POST   /v1/proofs/submit          # Submit proof & settle
GET    /v1/skills/discover        # Find skills
GET    /v1/agent/{id}/reputation  # Check reputation
```

---

## 🌐 Networks Supported

- **Stellar Testnet** (development)
- **Stellar Public Network** (production Q2 2026)

---

## 📝 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 💬 Community & Support

- **Discord:** [discord.gg/rota](https://discord.gg/rota)
- **Docs:** [docs.rota.dev](https://docs.rota.dev)
- **Email:** support@rota.dev
- **Twitter:** [@RotaAgents](https://twitter.com/RotaAgents)

---

**Ready to launch your autonomous agent economy?**

🚀 [Get Started Now](https://docs.rota.dev/quickstart)  
💡 [View Examples](https://github.com/DGuedz/rota/tree/main/examples)  
🔗 [Join the Community](https://discord.gg/rota)