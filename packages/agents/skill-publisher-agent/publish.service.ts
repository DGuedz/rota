import fs from 'fs';
import path from 'path';
import { SkillPublishRequest, SkillPublishResult } from './publish.types';
import { PublishValidator } from './publish.validator';

/**
 * Motor de Geração Determinística de Artefatos de Skill
 * Escreve a estrutura obrigatória na pasta /skills/<id>
 */
export class PublishService {
  /**
   * Recebe um candidato a skill, valida o manifesto e, se aprovado,
   * gera a estrutura completa da vitrine de distribuição.
   */
  static generateSkillPackage(request: SkillPublishRequest): SkillPublishResult {
    const validation = PublishValidator.validate(request);
    
    if (!validation.valid) {
      return {
        success: false,
        skillId: request.id || 'unknown',
        generatedPaths: [],
        errors: validation.errors
      };
    }

    const baseDir = path.resolve(process.cwd(), 'skills', request.id);
    const examplesDir = path.join(baseDir, 'examples');

    // 1. Criar a estrutura de diretórios
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true });
    }

    const generatedPaths: string[] = [];

    // 2. Gerar README.md (Vitrine e SEO)
    const readmeContent = this.buildReadme(request);
    fs.writeFileSync(path.join(baseDir, 'README.md'), readmeContent);
    generatedPaths.push(`${request.id}/README.md`);

    // 3. Gerar skill.md (Intenção técnica para Agentes)
    const skillMdContent = this.buildSkillMd(request);
    fs.writeFileSync(path.join(baseDir, 'skill.md'), skillMdContent);
    generatedPaths.push(`${request.id}/skill.md`);

    // 4. Gerar schema.json (Contrato de IO - Draft-07)
    const schemaContent = this.buildSchema(request);
    fs.writeFileSync(path.join(baseDir, 'schema.json'), schemaContent);
    generatedPaths.push(`${request.id}/schema.json`);

    // 5. Gerar pricing.md (Clareza Econômica)
    const pricingContent = this.buildPricingMd(request);
    fs.writeFileSync(path.join(baseDir, 'pricing.md'), pricingContent);
    generatedPaths.push(`${request.id}/pricing.md`);

    // 6. Gerar examples/curl.sh (Uso prático)
    const curlExample = this.buildCurlExample(request);
    fs.writeFileSync(path.join(examplesDir, 'curl.sh'), curlExample);
    generatedPaths.push(`${request.id}/examples/curl.sh`);

    return {
      success: true,
      skillId: request.id,
      generatedPaths
    };
  }

  private static buildReadme(req: SkillPublishRequest): string {
    return `# Skill: ${req.id}

## Visão Geral
${req.description}

## Status de Monetização
- **Modo:** \`${req.pricing.mode}\`
- **Asset:** \`${req.pricing.assetCode || 'N/A'}\`
- **Preço:** \`${req.pricing.amount || '0.00'}\`

## Como Usar
Esta skill requer que você envie payloads em conformidade com o \`schema.json\`.
Se o modo for \`paid\`, um pagamento x402 será exigido via HTTP 402.

\`\`\`bash
${req.commandExample}
\`\`\`

---
*Gerado automaticamente pelo ROTA Skill Publisher Agent.*
`;
  }

  private static buildSkillMd(req: SkillPublishRequest): string {
    return `# Technical Capability: ${req.id}

**Intent Matcher**: Use esta skill quando o objetivo for relacionado a:
"${req.description}"

**Inputs Esperados:**
Consulte o \`schema.json\` (Draft-07).

**Outputs Garantidos:**
Consulte o \`schema.json\` (Draft-07).

**Restrições:**
Apenas agentes autenticados ou provedores de pagamento válidos devem consumir este recurso em produção.
`;
  }

  private static buildSchema(req: SkillPublishRequest): string {
    const finalSchema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": `ROTA Skill Schema - ${req.id}`,
      "description": req.description,
      "input": req.schema.input,
      "output": req.schema.output
    };
    return JSON.stringify(finalSchema, null, 2);
  }

  private static buildPricingMd(req: SkillPublishRequest): string {
    return `# Pricing & Settlement Policy
    
Skill: \`${req.id}\`
Model: \`${req.pricing.mode.toUpperCase()}\`

## Regras
- Preço base: **${req.pricing.amount || '0.00'} ${req.pricing.assetCode || ''}**
- Recebedor principal: \`${req.pricing.recipientAddress || 'N/A'}\`
- Bond requirement: \`${req.pricing.bondRequired ? 'Sim' : 'Não'}\`

### x402 / MPP
Em modo \`paid\`, o cliente receberá um \`402 Payment Required\` com um header \`Www-Authenticate: L402...\`.
Você deve obter o token L402 no facilitador (ex: x402-testnet.rota.network) antes de refazer o request com \`Authorization: L402 <macaroon>:<preimage>\`.
`;
  }

  private static buildCurlExample(req: SkillPublishRequest): string {
    return `#!/bin/bash
# Exemplo gerado automaticamente
# ROTA Skill: ${req.id}

${req.commandExample}
`;
  }
}
