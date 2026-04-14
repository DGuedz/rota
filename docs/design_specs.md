# ROTA: Design & Asset Specifications

Este documento contém os briefings de imagem e as diretrizes de UI para a construção visual da ROTA, gerados automaticamente pela skill `a2ab-design-intelligence` sob as regras estritas do protocolo VSC (Economy-First, Zero-Emoji) e da North Star "Institutional Brutalism".

---

## 1. Image Briefings (Para Midjourney / DALL-E)

Utilize os prompts abaixo para gerar os assets visuais do site institucional.

### Asset 1: Hero Section Background (A Rede Global)
`[IMAGE BRIEFING]`
`STYLE`: Institutional Brutalism, high-end editorial, tactile, machine-like. Minimalist but heavy. Isometric perspective.
`SUBJECT`: Abstract representation of an autonomous agent network routing transactions. Nodes connected by data streams. A central hub representing the "escrow settlement" layer with geometric, cryptographic locks.
`CONSTRAINTS`: NO robots, NO emojis, NO neon cyber-punk tropes. Focus purely on value flow, nodes, escrow mechanisms, and trustless settlement visualization. Use ROTA Bone (warm parchment) and ROTA Black, with Signal Gold highlights. No 1px lines.

### Asset 2: Arquitetura Híbrida (Off-chain vs On-chain)
`[IMAGE BRIEFING]`
`STYLE`: Brutalist data-driven layout, technical blueprint, high contrast, editorial spacing.
`SUBJECT`: A split architecture diagram. The left side represents off-chain high-speed routing with rigid, structured data blocks. The right side represents on-chain trust and settlement with solid, immutable, locked geometry. A Signal Gold glow connects the two sides.
`CONSTRAINTS`: NO robots, NO emojis, NO cartoonish elements. Must look like a professional, enterprise-grade infrastructure diagram designed for CTOs. Heavy typography (serif).

### Asset 3: x402 Payment Gateway (Fricção vs Resolução)
`[IMAGE BRIEFING]`
`STYLE`: Minimalist cyber-security visualization, Institutional Brutalism.
`SUBJECT`: A digital gateway or firewall represented as a massive, heavy structure. On one side, data packets (agent requests) are halted. In the center, a cryptographic token (representing x402 payment) glows with a soft Signal Gold aura, acting as a key that opens the gate.
`CONSTRAINTS`: NO robots, NO emojis, NO coins or literal money bags. Use abstract representations of cryptography, access control, and data packets. Use warm parchment background (ROTA Bone).

---

## 2. UI Wireframe Spec (Landing Page B2B)

Diretrizes estruturais para a implementação da Landing Page no frontend (Next.js/TailwindCSS).

`[UI WIREFRAME SPEC]`
`SECTION`: Global Layout
`STYLE`: Institutional Brutalism. Rigid grid, 0px border radius, intentional asymmetry.
`COLORS`: 
- Background: ROTA Bone (`#fbf9f2`) base, `surface-container-low` (`#f6f4ec`) para distinção de seções.
- Typography: ROTA Black (`#0a0a0a`).
- Accents/Success: Signal Gold e Route Amber. Use glow (`box-shadow: 0 0 20px rgba(232, 195, 0, 0.3)`) para estados ativos.
`TYPOGRAPHY`: Instrument Serif (ou Newsreader) para Display/Headlines com tracking fechado. Inter (ou IBM Plex Sans) para UI e body text.
`CONTENT`: Must include technical proof (txHash, Soroban contract IDs). Zero fluff. Sem emojis. SEM dividers sólidos (1px lines).

### Estrutura de Blocos:
1. **Nav**: Logo minimalista. Uso de glassmorphism (surface semi-transparente com blur) sobre o ledger.
2. **Hero**: Headline em Serif brutalista. Assimetria intencional. CTA primário (`rounded-none`, ROTA Black background, texto Bone, com glow dourado no hover). Fundo com o Asset 1.
3. **The Friction**: Grid rígido. Comparativo "Traditional Web3 Agent" vs "ROTA Protocol". Separado por variação de tons (surface-container) ao invés de linhas divisórias.
4. **Hybrid Trust**: Imagem do Asset 2. Margens massivas ("breathing room").
5. **Live Proof (Terminal)**: Bloco estilo "sala de máquinas" mostrando logs reais de uma execução x402 bem sucedida, usando fonte monoespaçada e ghost borders.

---

## 3. Video Script Structure (Pitch Institucional)

Estrutura aprovada para o vídeo de demonstração técnica / hackathon pitch.

`[VIDEO SCRIPT STRUCTURE]`
`TOPIC`: ROTA 3-Minute Dev Walk-Through
1. **Technical Hook (0:00-0:15)**: A dor da confiança. "Se você já tentou deixar um agente possuir uma transação, conhece o inferno dos SDKs e nonces."
2. **The Solution (0:15-0:45)**: A rota mais curta. Gateway HTTP 402 + executor off-chain + liquidação Soroban.
3. **Live Demo (0:45-1:45)**: Tela dividida. Terminal rodando o agente (mostrando o 402 rejection, seguido do pagamento) vs Explorer da Stellar testnet mostrando a transação confirmada.
4. **Architecture (1:45-2:30)**: Explicação das session keys efêmeras e do policy engine. "O agente nunca vê a chave; o gas fica conosco."
5. **CTA (2:30-3:00)**: Fechamento B2B. "Entregamos time-to-market para a economia de agentes. Execute x402."
