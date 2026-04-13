# ROTA: 3-Minute Dev Walk-Through / Demonstração de 3 Minutos

**What I want to show you today:** / **O que vou mostrar hoje:**
How we stitched together a pragmatic "skill layer" so AI agents can call on-chain logic like any other function—without the usual SDK hell, gas juggling, or custody headaches. No marketing fluff, just the moving parts.
Como montamos uma camada prática de "skills" para que agentes de IA possam chamar lógica on-chain como qualquer outra função—sem o inferno de SDKs, malabarismo com gas ou dores de custódia. Sem blá-blá de marketing, só as peças móveis.

---

## 1. The friction I hit (0:00 – 0:30) / O atrito que encontrei (0:00 – 0:30)
* **Visual:** Split-screen: left side VS Code with a tiny TS agent, right side terminal throwing "missing native asset", "nonce mismatch", "insufficient funds".
* **Visual:** Tela dividida: lado esquerdo VS Code com um agente TS pequeno, lado direito terminal mostrando "missing native asset", "nonce mismatch", "insufficient funds".
* **Audio:**
  > "If you've ever tried to let an agent own a transaction, you know the drill.  
  > You pull in a 40 MB SDK, babysit nonces, top up wallets, guard private keys, and still get reverts at 3 a.m.  
  > That last mile—getting the sig on-chain—keeps eating the hackathon clock."
* **Áudio:**
  > "Se você já tentou deixar um agente possuir uma transação, conhece a rotina.  
  > Você puxa um SDK de 40 MB, cuida de nonces, abastece carteiras, guarda chaves privadas, e ainda assim leva reverts às 3h da manhã.  
  > Essa última milha—colocar a assinatura on-chain—continua consumindo o tempo do hackathon."

## 2. The shortest route we found (0:30 – 1:00) / A rota mais curta que encontramos (0:30 – 1:00)
* **Visual:** Hand-drawn 3-box diagram: (1) HTTP 402 gate, (2) off-chain executor, (3) Soroban settlement. Overlay: "one POST = one on-chain outcome".
* **Visual:** Diagrama de 3 caixas desenhado à mão: (1) Gateway HTTP 402, (2) executor off-chain, (3) liquidação Soroban. Overlay: "um POST = um resultado on-chain".
* **Audio:**
  > "We basically moved the mess off the agent.  
  > Agent sends JSON → we return 402 if it hasn't paid.  
  > After one XLM micro-payment the call hits our executor; we spin up an ephemeral key, run policy checks, and land the tx on Soroban.  
  > Agent gets back a tx-hash—no wallets, no gas, no drama."
* **Áudio:**
  > "Basicamente tiramos a bagunça do agente.  
  > Agente envia JSON → retornamos 402 se não pagou.  
  > Após um micropagamento XLM a chamada chega no executor; criamos uma chave efêmera, rodamos verificações de política, e aterrissamos a tx no Soroban.  
  > Agente recebe um hash de tx—sem carteiras, sem gas, sem drama."

## 3. Live demo: the 402 gate (1:00 – 1:40) / Demo ao vivo: o gateway 402 (1:00 – 1:40)
* **Visual:** Terminal: `npm run demo`. First call → 402 Payment Required. Second call carries x402 header, returns 200.
* **Visual:** Terminal: `npm run demo`. Primeira chamada → 402 Payment Required. Segunda chamada carrega header x402, retorna 200.
* **Audio:**
  > "Watch the logs.  
  > First attempt: straight 402.  
  > Agent wallet auto-creates the 1-XLM payment, stuffs it in the header, retries.  
  > Gate opens, request enters the executor queue. That's it—no manual signing."
* **Áudio:**
  > "Observe os logs.  
  > Primeira tentativa: 402 direto.  
  > Carteira do agente cria automaticamente o pagamento de 1-XLM, coloca no header, tenta novamente.  
  > Gateway abre, requisição entra na fila do executor. É isso—sem assinatura manual."

## 4. Gas-less run & policy engine (1:40 – 2:30) / Execução sem gas & motor de políticas (1:40 – 2:30)
* **Visual:** Terminal scroll: "SessionKey 0x… spawned", "Intent value ≤ 50 XLM ✓", "Allow-list ✓", "txHash 7c3f…". Browser: StellarExpert testnet page showing the same hash.
* **Visual:** Terminal rolando: "SessionKey 0x… spawned", "Intent value ≤ 50 XLM ✓", "Allow-list ✓", "txHash 7c3f…". Navegador: página testnet do StellarExpert mostrando o mesmo hash.
* **Audio:**
  > "Off-chain we mint a session key valid for 15 min.  
  > Policy engine enforces spend ceiling, time window, and contract whitelist—nothing fancy, just an allow-map in Postgres for now.  
  > Executor signs, submits, and the contract emits a proof event.  
  > Agent never sees the key; gas is on us."
* **Áudio:**
  > "Off-chain criamos uma chave de sessão válida por 15 min.  
  > Motor de políticas aplica teto de gastos, janela de tempo, e lista branca de contratos—nada sofisticado, só um mapa de permissões no Postgres por agora.  
  > Executor assina, envia, e o contrato emite um evento de prova.  
  > Agente nunca vê a chave; o gas fica conosco."

## 5. Trade-offs & why it ships faster (2:30 – 3:00) / Trade-offs & por que entrega mais rápido (2:30 – 3:00)
* **Visual:** GitHub README snippet: PROOF_OF_TRUST.md, architecture footnotes, "Time-to-Market" bullet.
* **Visual:** Trecho do README do GitHub: PROOF_OF_TRUST.md, notas de arquitetura, bullet "Time-to-Market".
* **Audio:**
  > "We're not pretending to be fully decentralised—we run the relay.  
  > But we do anchor every critical step on-chain: payment, policy hash, and final settlement are all Soroban events you can audit.  
  > For hackathons that's the sweet spot: agent devs stay in JS-land, and we shave days off integration.  
  > If the idea dies tomorrow, the contracts and the receipts are still on ledger—that's the part that actually needs to live forever."
* **Áudio:**
  > "Não fingimos ser totalmente descentralizados—nós operamos o relay.  
  > Mas ancoramos cada passo crítico on-chain: pagamento, hash da política, e liquidação final são todos eventos Soroban auditáveis.  
  > Para hackathons esse é o ponto ideal: devs de agentes ficam no JS, e cortamos dias da integração.  
  > Se a ideia morrer amanhã, os contratos e os comprovantes ainda estão no ledger—essa é a parte que realmente precisa viver para sempre."