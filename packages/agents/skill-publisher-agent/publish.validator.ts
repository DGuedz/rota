import { SkillPublishRequest } from './publish.types';

export class PublishValidator {
  /**
   * Garante que o input atende ao contrato mínimo do ecossistema ROTA
   * para se tornar uma skill publicável.
   */
  static validate(request: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request) {
      return { valid: false, errors: ['Request object is missing.'] };
    }

    if (!request.id || typeof request.id !== 'string') {
      errors.push('Missing or invalid "id". Must be a string (e.g. "my-skill").');
    }

    if (!request.description || typeof request.description !== 'string') {
      errors.push('Missing or invalid "description". It must clearly state the skill\'s value.');
    }

    if (!request.commandExample || typeof request.commandExample !== 'string') {
      errors.push('Missing "commandExample". Agents need to know how to call this.');
    }

    // Validação de Pricing
    if (!request.pricing || typeof request.pricing !== 'object') {
      errors.push('Missing "pricing" object.');
    } else {
      const p = request.pricing;
      if (!['free', 'paid', 'escrow'].includes(p.mode)) {
        errors.push('Pricing "mode" must be "free", "paid", or "escrow".');
      }
      
      if (p.mode === 'paid' || p.mode === 'escrow') {
        if (!p.assetCode) errors.push('Paid/Escrow mode requires an "assetCode" (e.g. "USDC").');
        if (!p.amount) errors.push('Paid/Escrow mode requires an "amount" (e.g. "1.50").');
        if (!p.recipientAddress) errors.push('Paid/Escrow mode requires a "recipientAddress".');
      }
    }

    // Validação de Schema
    if (!request.schema || typeof request.schema !== 'object') {
      errors.push('Missing JSON Schema for input/output.');
    } else {
      if (!request.schema.input || !request.schema.output) {
        errors.push('Schema must define both "input" and "output" definitions.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
