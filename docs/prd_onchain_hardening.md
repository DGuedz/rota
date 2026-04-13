# PRD: Hardening On-Chain da ROTA - Verificação x402 e Indexação de Eventos Soroban

## 1. Visão Geral

Este Documento de Requisitos de Produto (PRD) detalha as funcionalidades e requisitos para aprimorar a integração on-chain do protocolo ROTA. O objetivo principal é substituir implementações mockadas por interações reais com a blockchain Stellar/Soroban, especificamente na verificação de pagamentos x402 e na decodificação de eventos do contrato Soroban. Isso elevará a "prova de verdade de capacidade on-chain" da ROTA, garantindo liquidação atômica e rastreabilidade completa, conforme os princípios VSC (Economy-First).

## 2. Metas

*   **Eliminar Mocks:** Substituir o `MockVerificationProvider` do x402 por uma implementação que valide transações Stellar reais.
*   **Decodificação Completa de Eventos:** Implementar a decodificação correta dos tópicos de eventos do Soroban no `SorobanIndexer` usando `scValToNative`.
*   **Aumentar a Confiança:** Fortalecer a confiança na capacidade on-chain da ROTA, garantindo que todas as interações financeiras sejam verificáveis e rastreáveis na blockchain.
*   **Preparação para Produção:** Mover o projeto para um estado mais próximo de "produção", onde as interações on-chain são totalmente funcionais e auditáveis.

## 3. Problemas Atuais

Conforme identificado no "Relatório de Build e Capacidade On-Chain":

*   **Verificação x402 Server-Side Mockada:** O `X402Service` (apps/api/src/payments/x402.service.ts) utiliza atualmente um `MockVerificationProvider`. Isso significa que, embora o cliente possa gerar tokens x402 válidos (XDRs assinados), a API não os valida de forma real na blockchain Stellar, comprometendo a "prova de pagamento" on-chain.
*   **Decodificação Incompleta de Tópicos de Eventos:** O `SorobanIndexer` (apps/api/src/stellar/soroban.indexer.ts) possui um `TODO` no método `decodeTopicName`. Atualmente, ele retorna um valor fixo (`'escrow.settled'`), o que impede a API de reagir a diferentes tipos de eventos on-chain (e.g., `escrow.slashed`, `escrow.disputed`) de forma dinâmica e precisa.

## 4. Funcionalidades Propostas

### 4.1. Verificação Real de Pagamentos x402

**Descrição:** Implementar um `StellarX402VerificationProvider` que substitua o mock e utilize o Stellar SDK para validar a autenticidade e o conteúdo dos tokens x402 (XDRs de transação) na rede Stellar.

**Detalhes:**
*   **Validação de Assinatura:** Verificar se o XDR foi assinado pela chave pública do pagador.
*   **Validação de Conteúdo:** Analisar o XDR para garantir que contém uma operação de pagamento válida, com o ativo, valor e destinatário corretos, conforme o `X402PaymentRequirement`.
*   **Consulta On-Chain:** Opcionalmente, consultar o status da transação na rede Stellar para garantir que ela foi submetida e liquidada.
*   **Integração:** O `X402Service` será atualizado para usar esta nova implementação.

### 4.2. Decodificação Completa de Tópicos de Eventos Soroban

**Descrição:** Aprimorar o `SorobanIndexer` para decodificar corretamente os tópicos de eventos emitidos pelo contrato Soroban, utilizando a função `scValToNative` do Stellar SDK.

**Detalhes:**
*   **`scValToNative`:** Utilizar `scValToNative` para converter os `ScVal` (Soroban Value) dos tópicos de eventos em tipos nativos de Rust/TypeScript.
*   **Mapeamento de Eventos:** Mapear os tópicos decodificados para nomes de eventos compreensíveis (e.g., `escrow.settled`, `escrow.slashed`, `escrow.disputed`).
*   **Publicação Dinâmica:** O `RotaEventBus` receberá o nome do evento decodificado, permitindo que os agentes reajam a todos os tipos de eventos on-chain de forma precisa.

## 5. Requisitos Técnicos

### 5.1. Verificação Real de Pagamentos x402

*   **Tecnologia:** Stellar SDK (`@stellar/stellar-sdk`).
*   **Componentes:**
    *   Novo `StellarX402VerificationProvider` implementando `X402VerificationProvider`.
    *   Atualização do `X402Service` para instanciar e usar o novo provider.
    *   Acesso ao `StellarClient` para interagir com a rede Stellar.
*   **Validações:**
    *   Verificar a rede (Testnet/Mainnet) do XDR.
    *   Validar a estrutura do XDR como uma transação Stellar.
    *   Extrair a operação de pagamento e seus detalhes (asset, amount, destination).
    *   Comparar com os `X402PaymentRequirement` esperados.
    *   Verificar a assinatura da transação.

### 5.2. Decodificação Completa de Tópicos de Eventos Soroban

*   **Tecnologia:** Stellar SDK (`@stellar/stellar-sdk`).
*   **Componentes:**
    *   Atualização do método `decodeTopicName` em `SorobanIndexer`.
    *   Utilização da função `scValToNative` do Stellar SDK para converter `ScVal` em tipos legíveis.
    *   Lógica para interpretar os `Symbol`s decodificados e construir o nome do evento (e.g., "ESCROW.INIT" -> "escrow.initialized").
*   **Dependências:** Garantir que a versão do Stellar SDK utilizada suporta `scValToNative` para os tipos de `ScVal` de tópicos de eventos.

## 6. Critérios de Aceitação

*   **Verificação x402:**
    *   Um token x402 (XDR de transação Stellar) válido, assinado e com os parâmetros de pagamento corretos, deve ser aceito pelo `X402Service`.
    *   Um token x402 inválido (assinatura incorreta, parâmetros de pagamento errados, rede incorreta) deve ser rejeitado pelo `X402Service`.
    *   Testes de integração devem simular o fluxo completo de um agente enviando um x402 e a API validando-o.
*   **Decodificação de Eventos:**
    *   O `SorobanIndexer` deve decodificar corretamente todos os tipos de eventos emitidos pelo contrato Soroban (e.g., `escrow.settled`, `escrow.slashed`, `escrow.disputed`, `escrow.initialized`, `bond.deposited`).
    *   Os eventos decodificados devem ser publicados no `RotaEventBus` com seus nomes corretos.
    *   Testes unitários para `decodeTopicName` devem cobrir todos os cenários de tópicos de eventos.

## 7. Métricas de Sucesso

*   **Taxa de Sucesso da Verificação x402:** 100% de validação correta para tokens válidos/inválidos em testes.
*   **Precisão da Decodificação de Eventos:** 100% de decodificação correta de tópicos de eventos em testes.
*   **Cobertura de Testes:** Aumento da cobertura de testes unitários e de integração para as funcionalidades on-chain.
*   **Remoção de Mocks:** O `MockVerificationProvider` e o `TODO` de decodificação de eventos devem ser removidos do código-base.

## 8. Escopo

### Em Escopo:
*   Implementação do `StellarX402VerificationProvider`.
*   Atualização do `X402Service` para usar o novo provider.
*   Implementação da lógica `scValToNative` em `SorobanIndexer::decodeTopicName`.
*   Testes unitários e de integração para as novas funcionalidades.

### Fora de Escopo:
*   Implementação de novas funcionalidades no contrato Soroban de escrow.
*   Otimizações de performance do `SorobanIndexer` (além da decodificação).
*   Integração com outras redes blockchain ou provedores de pagamento.
*   Refatoração dos avisos (`warnings`) do `cargo check` (será tratado em um PRD separado).

## 9. Próximos Passos

1.  Criação de tarefas de desenvolvimento detalhadas com base neste PRD.
2.  Implementação das funcionalidades.
3.  Testes rigorosos e validação.
4.  Deploy para ambientes de teste.
