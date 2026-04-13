# ROTA Agentic Runtime

A ROTA utiliza uma arquitetura baseada em eventos para coordenar seu Workforce (agentes autônomos operacionais). O runtime é responsável por escutar eventos do sistema, despachar para o roteador (`Router Agent`) e acionar o respectivo agente de destino.

## Componentes Centrais

### 1. Event Bus (`DomainEventService` e `RotaEventBus`)
Todos os eventos relevantes (ex: mudanças no banco, chamadas API, eventos do GitHub) são persistidos como `DomainEvent` no Prisma. O `RotaEventBus` faz o polling/notificação desses eventos para os listeners registrados.

### 2. Agent Dispatcher (`AgentDispatcher`)
É o listener principal do `EventBus`. Ao receber um novo evento:
1. Converte o `DomainEvent` em `RotaEvent` (interface abstraída).
2. Chama o `runRouter(rotaEvent)`.
3. Registra um `AgentExecutionLog` para a tomada de decisão do roteador.
4. Despacha o evento para o runtime específico do agente de destino (se o roteador aprovar).

### 3. Router Agent (`Router Agent`)
O roteador é o gatekeeper. Ele possui:
- **Triggers**: Mapa de eventos `(source, type)` para agentes de destino.
- **Policies**: Guardrails que impedem execuções proibidas ou forçam aprovação humana.

### 4. Agentes Especializados
Exemplo: **GitHub Distribution Agent** (`github-distribution-agent`)
- Ativado por eventos como `repo.push_main` e `repo.pr_merged`.
- Gera artefatos de distribuição (`CHANGELOG_ENTRY`, `RELEASE_DRAFT`, etc).
- Seu resultado é gravado como um `AgentExecutionLog` detalhando artefatos gerados, sucesso ou falha, e latência.

## Ciclo de Vida (End-to-End)

1. Um PR é mergeado e a webhook do GitHub bate na nossa API (ou inserimos o evento manualmente).
2. `DomainEventService` cria um `DomainEvent` com type `repo.pr_merged` e source `github`.
3. O `AgentDispatcher` capta e envia para o `Router Agent`.
4. O roteador identifica a regra em `supportedTriggers` e decide que o destino é o `github-distribution-agent`.
5. O `AgentDispatcher` grava um log (`DISPATCHED`) para o Roteador e invoca o `runDistributionAgent`.
6. O `github-distribution-agent` recebe, valida suas `policies` locais, processa a ação simulando a geração de um `CHANGELOG_ENTRY`.
7. Retorna o sucesso.
8. O `AgentDispatcher` grava o log (`SUCCESS`) para o `DISTRIBUTION` agent com os artefatos em `output`.

## TODOs (Integrações Futuras)

- [ ] Integrar `Octokit` / GitHub App real dentro do runtime do `github-distribution-agent` (hoje mockado).
- [ ] Implementar as filas de Redis (BullMQ) dentro do `AgentDispatcher` para tornar o disparo assíncrono entre processos.
- [ ] Construir dashboard para aprovação humana (quando `status === 'requires_approval'`).