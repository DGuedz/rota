# ROTA: 3-Minute Dev Walk-Through

**What I want to show you today:**
How we stitched together a pragmatic “skill layer” so AI agents can call on-chain logic like any other function—without the usual SDK hell, gas juggling, or custody headaches. No marketing fluff, just the moving parts.

---

## 1. The friction I hit (0:00 – 0:30)
* **Visual:** Split-screen: left side VS Code with a tiny TS agent, right side terminal throwing “missing native asset”, “nonce mismatch”, “insufficient funds”.
* **Audio:**
  > “If you’ve ever tried to let an agent own a transaction, you know the drill.  
  > You pull in a 40 MB SDK, babysit nonces, top up wallets, guard private keys, and still get reverts at 3 a.m.  
  > That last mile—getting the sig on-chain—keeps eating the hackathon clock.”

## 2. The shortest route we found (0:30 – 1:00)
* **Visual:** Hand-drawn 3-box diagram: (1) HTTP 402 gate, (2) off-chain executor, (3) Soroban settlement. Overlay: “one POST = one on-chain outcome”.
* **Audio:**
  > “We basically moved the mess off the agent.  
  > Agent sends JSON → we return 402 if it hasn’t paid.  
  > After one XLM micro-payment the call hits our executor; we spin up an ephemeral key, run policy checks, and land the tx on Soroban.  
  > Agent gets back a tx-hash—no wallets, no gas, no drama.”

## 3. Live demo: the 402 gate (1:00 – 1:40)
* **Visual:** Terminal: `npm run demo`. First call → 402 Payment Required. Second call carries x402 header, returns 200.
* **Audio:**
  > “Watch the logs.  
  > First attempt: straight 402.  
  > Agent wallet auto-creates the 1-XLM payment, stuffs it in the header, retries.  
  > Gate opens, request enters the executor queue. That’s it—no manual signing.”

## 4. Gas-less run & policy engine (1:40 – 2:30)
* **Visual:** Terminal scroll: “SessionKey 0x… spawned”, “Intent value ≤ 50 XLM ✓”, “Allow-list ✓”, “txHash 7c3f…”. Browser: StellarExpert testnet page showing the same hash.
* **Audio:**
  > “Off-chain we mint a session key valid for 15 min.  
  > Policy engine enforces spend ceiling, time window, and contract whitelist—nothing fancy, just an allow-map in Postgres for now.  
  > Executor signs, submits, and the contract emits a proof event.  
  > Agent never sees the key; gas is on us.”

## 5. Trade-offs & why it ships faster (2:30 – 3:00)
* **Visual:** GitHub README snippet: PROOF_OF_TRUST.md, architecture footnotes, “Time-to-Market” bullet.
* **Audio:**
  > “We’re not pretending to be fully decentralised—we run the relay.  
  > But we do anchor every critical step on-chain: payment, policy hash, and final settlement are all Soroban events you can audit.  
  > For hackathons that’s the sweet spot: agent devs stay in JS-land, and we shave days off integration.  
  > If the idea dies tomorrow, the contracts and the receipts are still on ledger—that’s the part that actually needs to live forever.”
