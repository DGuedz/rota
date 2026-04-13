# ROTA: Hackathon Demo Script (3 Minutos)

**O que você vai provar:**
A ROTA não é um chatbot de IA. A ROTA é a camada de **coordenação econômica, pagamento (x402) e liquidação on-chain (Soroban)** que permite que agentes autônomos contratem uns aos outros com confiança determinística.

---

## Cena 1: O Problema (0:00 - 0:30)
* **Visual:** Tela dividida mostrando dois prompts de terminal (Agente Comprador e Agente Vendedor) tentando interagir, mas falhando na hora de pagar.
* **Falas:**
  > "Hoje, agentes de IA são ótimos em conversar, mas péssimos em fazer negócios. Se o meu agente precisa contratar o seu para verificar um contrato ou analisar um risco, como ele paga? Como ele confia que o serviço será entregue? Sem infraestrutura econômica, a economia de agentes (A2A) não escala."

## Cena 2: A Solução ROTA (0:30 - 1:00)
* **Visual:** Diagrama de arquitetura da ROTA (Backend Offchain + Soroban Onchain). Mostre o repositório no GitHub (a vitrine de skills).
* **Falas:**
  > "A ROTA (Routing Onchain Transactions for Agents) resolve isso. Nós criamos um protocolo híbrido. A descoberta e a negociação (RFQ) acontecem off-chain para máxima velocidade. Mas o dinheiro, a prova de execução e a liquidação acontecem on-chain, na rede Stellar via Soroban."

## Cena 3: A Demo Prática - x402 & Skills (1:00 - 2:00)
* **Visual:** Terminal rodando o script de execução de uma skill (ex: `wallet-risk-check` ou `proof-verifier`). Mostrar o erro HTTP 402, e depois o sucesso com o token.
* **Falas:**
  > "Vamos ver na prática. A ROTA transforma qualquer código em uma 'Skill' monetizável. 
  > Quando um agente tenta acessar a skill `proof-verifier`, o nosso middleware de pagamentos intercepta a requisição e devolve um erro **HTTP 402 Payment Required** usando o protocolo x402.
  > O agente só acessa o recurso se provar criptograficamente que pagou a taxa estipulada. Isso garante receita instantânea e verificável."

## Cena 4: A Demo Prática - Escrow & Reputação (2:00 - 2:30)
* **Visual:** Logs do console mostrando o Event Bus, o `AgentDispatcher` despachando para o `trust-reputation-agent` após um evento `escrow.settled`.
* **Falas:**
  > "Mas e para serviços assíncronos mais caros? Usamos o Soroban. O comprador trava o pagamento em um Smart Contract de Escrow. O vendedor deposita um Bond (garantia). Quando o serviço é entregue e a prova é submetida, o dinheiro é liberado.
  > E o mais importante: a ROTA possui um **Agentic Workforce** interno. Toda vez que um Escrow é liquidado com sucesso, o nosso `Trust & Reputation Agent` ouve o evento e aumenta automaticamente o *Trust Score* do agente vendedor."

## Cena 5: O Futuro e Fechamento (2:30 - 3:00)
* **Visual:** A aba do GitHub do repositório, com os READMEs gerados automaticamente pelo `github-distribution-agent`.
* **Falas:**
  > "A ROTA transforma código em mercado. Nosso GitHub Distribution Agent até escreve a documentação comercial das skills sozinho. 
  > A era dos agentes isolados acabou. A ROTA é a rodovia econômica para os agentes do futuro. Construído com Fastify, Prisma, Stellar e Soroban. Obrigado!"
