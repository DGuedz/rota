# Product Requirements Document (PRD): ROTA Institutional Landing Page

## 1. Contexto e Objetivo
A ROTA (Routing Onchain Transactions for Agents) concluiu sua fundação arquitetural híbrida (Fastify + Soroban). A atual documentação HTML gerada via Stitch serve como o wireframe base. O objetivo agora é desenvolver e implementar a Landing Page Institucional (B2B) oficial do protocolo.

Esta página não é para consumidores finais (B2C), mas para arquitetos de software, engenheiros Web3, CTOs e desenvolvedores de agentes autônomos. A página deve converter o valor técnico complexo (Liquidação atômica, x402, gas-less execution) em clareza institucional, seguindo rigidamente a política VSC (Zero-Emoji, Economy-First).

## 2. Público-Alvo
- Desenvolvedores de Agentes IA (Buscando infraestrutura de execução on-chain).
- Arquitetos Web3/DeFi (Avaliando segurança, Soroban e infraestrutura de liquidação).
- Investidores e Parceiros B2B institucionais.

## 3. Diretrizes de Design e Copy (Strict VSC)
Baseado no `a2ab-design-copy-intelligence.md`:
- **Tom de Voz**: Seco, institucional, brutalmente honesto. Foco em ROI, segurança e liquidação trustless. 
- **Proibido**: Uso de Emojis, promessas de "mágica de IA", menções a "chatbots", ou ilustrações de "robôs fofos".
- **Direção de Arte**: Cyber-finance, Dark Mode predominante, wireframes limpos. As imagens devem focar no "fluxo de valor" (diagramas de nós, tokens transitando, arquitetura de escrow, Soroban network).

## 4. Estrutura da Página (User Flow)

A landing page deve ser "One-Page" estruturada na seguinte hierarquia de conversão:

### 4.1. Hero Section (Agressividade Técnica)
- **Headline**: "Routing Onchain Transactions for Agents."
- **Subheadline**: "The trusted routing layer where autonomous agents discover capabilities, negotiate conditions, and settle value with cryptographic proof."
- **Visual**: A animação "Refined Global Network" gerada no Stitch (nós conectando liquidação offchain/onchain).
- **Primary CTA**: "Execute x402" (Leva para a documentação de API).
- **Secondary CTA**: "View Smart Contracts" (Leva para o Soroban explorer / GitHub).

### 4.2. A Fricção / Problema
- **Conceito**: Mostrar a dor real de agentes lidando com transações (SDKs pesados, gestão de nonces, custódia de chaves privadas).
- **Apresentação**: Tabela comparativa "Traditional Web3 Agent vs ROTA Protocol".

### 4.3. Arquitetura Híbrida (A Solução)
- **Conceito**: Explicar a fronteira entre Offchain (Speed & Coordination via Fastify/BullMQ) e Onchain (Trust & Settlement via Soroban).
- **Componentes Visuais**: Diagrama técnico limpo mostrando o fluxo: `Intent -> x402 Gate -> Session Key -> Soroban Escrow -> Proof Hash`.

### 4.4. Prova Onchain (Transparência)
- **Conceito**: Demonstrar que o protocolo é auditável hoje.
- **Elemento**: Um terminal mockado (ou iframe) rodando o script de demo, mostrando o log do `EventBus` validando um pagamento `x402` e emitindo um txHash da testnet Stellar.

### 4.5. Footer & CTAs Finais
- Links institucionais: GitHub, Tech Audit Report, Architecture Docs.
- Manifesto Economy-First.

## 5. Requisitos Técnicos de Implementação

### 5.1. Stack Tecnológico
- **Framework**: Next.js (React) ou HTML/TailwindCSS (dependendo da alocação de tempo para a entrega).
- **Estilização**: TailwindCSS (configurado para Dark Mode by default).
- **Animações**: Framer Motion ou Three.js (para manter o "Refined Global Network Animation" otimizado e leve).

### 5.2. Requisitos Não-Funcionais
- **Performance**: TTI (Time to Interactive) inferior a 1.2s.
- **Responsividade**: Mobile-first, mas com foco em desktop (onde desenvolvedores consomem documentação técnica).
- **SEO**: Meta tags rigorosas focadas em "Agentic Economy", "Web3 Payments", "Soroban Smart Contracts", "x402 Protocol".

## 6. Fases de Execução

1. **Setup do Repositório Frontend**: Criar diretório `apps/web` no monorepo atual.
2. **Migração do Stitch**: Transcrever a estrutura HTML bruta do arquivo `docs/landing_page.html` para componentes reutilizáveis.
3. **Refinamento de Copy**: Revisar todos os textos do HTML do Stitch para garantir a conformidade 100% VSC (Zero-emoji).
4. **Implementação Visual**: Aplicar a paleta Cyber-finance e o layout de grid.
5. **Deploy**: Configurar Vercel/Hostinger release ops (Skill `hostinger-vercel-release-ops` pode ser utilizada aqui).

---
**Status**: Aprovado para execução imediata no diretório `apps/web`.