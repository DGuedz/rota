# PRD: Fase "Truth" — ROTA Web3 Settlement Integration
**Data:** 13 de Abril de 2026
**Status:** Em execução (Hackathon Prep)
**Objetivo Principal:** Evoluir o status da ROTA de "Orquestrador de Backend Mockado" para "Infraestrutura de Settlement Onchain", integrando oficialmente o SDK x402 e contratos Soroban.

## 1. Visão Geral do Produto (A "Fase Truth")
A Fase Truth é a etapa final de integração Web3 do protocolo ROTA. A promessa institucional do projeto ("Economic Settlement para Agentes") precisa de lastro técnico. O backend já lida com o roteamento, BullMQ e reputação. Esta fase conecta as "pontas soltas" da rede Stellar: validação de assinaturas reais do protocolo x402 (usando o padrão Coinbase/OpenZeppelin) e o despacho/escuta de eventos reais de Escrow nos smart contracts Soroban via RPC.

## 2. Problema a Resolver
Atualmente, o `StellarClient` da ROTA apenas simula conexões (MockProvider). A verificação do header `x-rota-payment-token` (x402) retorna sucesso sem validação onchain. O contrato de Escrow (`contracts/soroban`) existe isoladamente em Rust, mas o backend não possui um *Relayer* ou invocador para interagir com ele na testnet.

## 3. Solução Proposta
A solução exige a implementação estrita das ferramentas oficiais da Stellar e OpenZeppelin:
- **x402 Verification:** Integrar o `@stellar/stellar-sdk` e o `x402-stellar` (ou o Facilitator OpenZeppelin) para verificar a assinatura (auth-entry) da requisição HTTP.
- **Soroban Integration:** Utilizar o `Soroban RPC` para consultar o status de locks e depositar eventos na testnet.
- **Developer Tools:** Adotar a documentação oficial (`developers.stellar.org/docs`) e os `openzeppelin-skills` como referência de arquitetura segura.

---

# 🛠 Plano de Execução (4 Grandes Tarefas / 8 Subtarefas)

Abaixo o detalhamento técnico e prático para o Trae / Engenheiro de Protocolo executar a integração em tempo recorde para o hackathon.

## Tarefa 1: Autenticação Criptográfica (x402 Real)
*Substituir o "MockProvider" pelo verificador oficial de assinaturas.*
- **[Subtarefa 1.1] Integrar o SDK Stellar:** Adicionar `@stellar/stellar-sdk` no `apps/api` e atualizar o `StellarClient` para inicializar a conexão com a testnet oficial (`https://soroban-testnet.stellar.org`).
- **[Subtarefa 1.2] Verificação de Assinatura (Auth Entry):** Substituir a lógica fake no `x402.middleware.ts` ou rota de skills para validar criptograficamente o `x-rota-payment-token` contra a chave pública do agente remetente.

## Tarefa 2: Liquidação Onchain (Soroban RPC)
*Fazer a API despachar e ler estados do smart contract.*
- **[Subtarefa 2.1] Setup do Soroban Client:** Atualizar o método `getTransactionStatus` no `StellarClient` para consultar a rede real, utilizando a lib RPC do Stellar.
- **[Subtarefa 2.2] Listener de Eventos (Opcional/Webhook):** Criar um mecanismo simples no backend (ou via script) para ler os eventos emitidos pelo contrato Soroban (ex: `escrow.settled`) e injetá-los no nosso `EventBus` do BullMQ.

## Tarefa 3: Hardening de Segurança (OpenZeppelin Padrão)
*Garantir que as integrações sigam as melhores práticas.*
- **[Subtarefa 3.1] Revisão do Contrato:** Utilizar os padrões de segurança referenciados pela iniciativa `openzeppelin-skills` (Stellar) para garantir que o Auth Model e o Time-lock do Escrow em Rust estão imunes a exploits comuns de Soroban.
- **[Subtarefa 3.2] Sanitização do Payload:** Assegurar que os inputs de pagamento no backend sejam rigidamente tipados e sanitizados antes de serem processados pelo verificador x402.

## Tarefa 4: O "End-to-End" Demo
*A prova definitiva de funcionamento para os jurados.*
- **[Subtarefa 4.1] Deploy Testnet Real:** Realizar o deploy do `escrow-interface` na Soroban Testnet e fixar o `CONTRACT_ID` no arquivo `.env`.
- **[Subtarefa 4.2] O Script "Smoke Test":** Criar um script Node.js (`scripts/simulate-x402-payment.ts`) que gera um par de chaves real na testnet, assina um payload x402 válido, bate na nossa rota `/skills/proof-verifier/execute` e retorna a comprovação do settlement.

---
**Critério de Sucesso:** A rota `/agents/auditor/execute` deve retornar `REAL` e `PRODUTO_REAL` ao escanear o banco de dados, provando que não há mais validações mockadas no pipeline.