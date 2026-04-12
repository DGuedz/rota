# ROTA Changelog

All notable changes to the ROTA protocol, infrastructure, and agent workforce will be documented in this file.

## [Unreleased]
### Added
- **GitHub Distribution Agent**: Integrated directly into the repository structure to automate publishing and documentation sync.
- **Skill Monetization Pipeline**: First skill `wallet-risk-check` deployed as a unit of paid execution.
- **Contract Event Indexer**: Polling infrastructure connecting Soroban to the Event Bus.
- **Escrow Bridge Lifecycle**: `init_escrow`, `deposit_bond`, `submit_proof`, `settle`, and `slash`.
- **Agent Runtime**: Dispatcher and internal event bus connecting domains and the Agent Workforce.
- **X402 Payment Layer**: Protection middleware and verification service for Paid Execution.

## [0.1.0] - 2024-04-12
### Added
- **Foundation**: Scaffolded the ROTA monorepo (Fastify + Prisma + PostgreSQL + Redis).
- **Core Architecture Rules**: Defined the Hybrid Trust architecture (Offchain Coordination / Onchain Settlement).
- **Workforce Agents Scaffold**: Setup for the 5 core agents (Router, Distribution, Publisher, Watcher, Trust).
- **GitHub SEO Layer**: Initial structured READMEs for developer discovery.
