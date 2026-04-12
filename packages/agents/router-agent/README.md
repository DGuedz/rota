# ROTA Router Agent

O cérebro operacional e central de despacho do **Workforce Agentic** da ROTA.

## 🎯 Missão
Orquestrar eventos vindos do GitHub, Backend, Protocolo e Settlement, e decidir qual agente especializado deve receber e processar cada intenção.

O Router **NÃO** produz conteúdo, não altera contratos inteligentes e não manipula código de skills. Ele apenas **roteia**.

## 🛡️ Nível de Autonomia
**Nível 3** — Executa com guardrails rígidos.

## 🚀 Gatilhos Suportados (Triggers)
O Router monitora os seguintes domínios e delega a ação:

| Evento | Fonte | Agente Destino |
| --- | --- | --- |
| `github.push` | `github` | `github-distribution-agent` |
| `github.pr_merged` | `github` | `github-distribution-agent` |
| `github.release` | `github` | `github-distribution-agent` |
| `github.skill_folder_created` | `github` | `github-distribution-agent` |
| `feature.ready` | `github` | `skill-publisher-agent` |
| `issue.publishable` | `github` | `skill-publisher-agent` |
| `protocol.stellar_update` | `protocol` | `protocol-watcher-agent` |
| `protocol.x402_update` | `protocol` | `protocol-watcher-agent` |
| `settlement.success` | `settlement` | `trust-reputation-agent` |
| `settlement.dispute` | `settlement` | `trust-reputation-agent` |
| `settlement.slash` | `settlement` | `trust-reputation-agent` |
| `sla.failed` | `backend` | `trust-reputation-agent` |

## 🛑 Guardrails e Policies (Ações Proibidas)
- `write_code`: O Router não pode alterar o código-fonte do repositório.
- `publish_content`: O Router não pode editar ou aprovar docs.
- `alter_pricing`: O Router não manipula modelos financeiros ou valores em Soroban.
- `modify_smart_contracts`: Bloqueado.
- `update_state_directly`: Todo o estado é delegado ao agente responsável.

## 📥 Inputs / 📤 Outputs
- **Input**: Interface `RotaEvent` (JSON com `eventId`, `source`, `type`, `payload` e `timestamp`).
- **Output**: Interface `RouteResult` (JSON contendo os detalhes do roteamento, se foi despachado e para qual agente).

## 📊 KPIs
- Acurácia do Roteamento (Dispatch accuracy).
- Taxa de rotas falhas (Failed route rate).
- Latência de despacho de evento (Event latency).

## 📋 TODOs e Integrações (Próximos Passos)
- [ ] Implementar fila distribuída no Redis para realizar o dispatch em tempo real para os agentes de destino.
- [ ] Integrar endpoints reais ou filas de consumo dos 4 agentes operacionais (`github-distribution-agent`, `skill-publisher-agent`, `trust-reputation-agent`, `protocol-watcher-agent`).
- [ ] Refinar estratégia de retry (retry com backoff vs drop).
