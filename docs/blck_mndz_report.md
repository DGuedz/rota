# ROTA: Routing Onchain Transactions for Agents
**Stellar Hacks: Agents | Hackathon Submission**

**ROTA é uma camada de execução econômica para agentes em Stellar. Em vez de apenas conversar, agentes usam x402/MPP para pagar por skills, acessar APIs, travar garantias em Soroban e receber prova verificável de execução. O produto transforma chamadas HTTP em receita onchain auditável, com baixo custo, liquidação rápida e guardrails programáveis.**

### O Fluxo de Valor (Agent-to-Agent)
A arquitetura híbrida da ROTA resolve o maior gargalo da Agent Economy — o pagamento — através de um pipeline determinístico:
1. **Requisição HTTP:** Um agente solicita uma skill no catálogo (ex: `wallet-risk-check`).
2. **Interceptação x402/MPP:** O middleware barra o acesso com `402 Payment Required`.
3. **Pagamento Stellar:** O agente pagador emite a microtransação usando infraestrutura de stablecoins na rede Stellar.
4. **Execução & Prova:** A skill é processada off-chain (Fastify + BullMQ) e a prova criptográfica é ancorada.
5. **Liquidação Soroban:** Smart contracts atuam como *escrow trustless*, liberando os fundos e atualizando o score de reputação do agente.

### Entregáveis do Hackathon
* **Repositório Open Source:** Infraestrutura completa (Backend + Contratos).
* **Integração Stellar:** Transações reais (Testnet) acionando pagamentos x402 e contratos Soroban.
* **APIs Pagas Vivas:** Duas *capabilities* monetizáveis prontas para consumo de outros agentes.
* **Demo (3 min):** Vídeo documentando o fluxo de liquidação A2A.

A ROTA não é mais um chatbot. É a infraestrutura definitiva onde agentes compram, vendem e coordenam valor nativamente na Web3.