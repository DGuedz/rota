import { FastifyRequest, FastifyReply } from 'fastify';
import { X402_CONSTANTS } from './x402.constants';
import { X402VerificationResult } from './x402.types';
import { X402Service, StellarX402VerificationProvider } from './x402.service';
import { StellarClient } from '../stellar/stellar.client';
import { getX402Config } from './x402.config';

// Instanciar o StellarClient e o X402Service globalmente para o middleware
const stellarClient = new StellarClient();
const x402Config = getX402Config();
const x402Service = new X402Service(new StellarX402VerificationProvider(stellarClient, x402Config)); 

/**
 * Interface customizada que as rotas pagas podem declarar.
 */
export interface X402RouteConfig {
  requiresPayment: boolean;
  price?: string; // se override
}

export async function x402Middleware(request: FastifyRequest, reply: FastifyReply) {
  // 1. O middleware extrai a configuração de pagamento anexada à rota
  const routeConfig = (request.routeOptions.config as { x402?: X402RouteConfig })?.x402;

  // 2. Se a rota não exige pagamento, libera o fluxo.
  if (!routeConfig || !routeConfig.requiresPayment) {
    return;
  }

  // 3. Busca o token no cabeçalho
  const paymentToken = request.headers[X402_CONSTANTS.HEADER_PAYMENT_TOKEN] as string;

  if (!paymentToken) {
    return replyPaymentRequired(reply, routeConfig);
  }

  // 4. Delega a verificação do token para o service
  const result: X402VerificationResult = await x402Service.verifyToken(paymentToken, {
    priceOverride: routeConfig.price,
    routeUrl: request.url,
  });

  if (!result.isValid) {
    request.log.warn(`[X402] Invalid token for ${request.url}: ${result.errorReason}`);
    return replyPaymentRequired(reply, routeConfig);
  }

  // 5. Fluxo liberado, anexa os metadados do pagamento para a skill real usar
  (request as any).x402Payment = {
    paymentHash: result.paymentHash,
    amountPaid: result.amountPaid
  };
}

/**
 * Função utilitária que constrói a resposta 402 Payment Required
 * seguindo as normas RFC adaptadas para o padrão ROTA.
 */
function replyPaymentRequired(reply: FastifyReply, config: X402RouteConfig) {
  const requirement = x402Service.buildPaymentRequirement(config.price);

  // A RFC dita que devemos responder com status 402 e cabeçalho Www-Authenticate
  const authenticateHeader = `${X402_CONSTANTS.AUTH_SCHEME} amount="${requirement.amount}", asset="${requirement.assetCode}", recipient="${requirement.recipientAddress}", url="${requirement.facilitatorUrl}"`;

  return reply
    .code(X402_CONSTANTS.HTTP_STATUS_PAYMENT_REQUIRED)
    .header(X402_CONSTANTS.HEADER_PAYMENT_REQUIRED, authenticateHeader)
    .send({
      error: 'Payment Required',
      message: 'This endpoint requires an X402 payment proof to execute.',
      requirement
    });
}
