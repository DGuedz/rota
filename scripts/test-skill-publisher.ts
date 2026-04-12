import { RotaEventBus } from '../apps/api/src/events/event-bus';
import { DomainEventService } from '../apps/api/src/events/domain-event.service';
import { AgentDispatcher } from '../apps/api/src/agents/dispatcher';
import { RotaEvent } from '../packages/shared-types';
import fs from 'fs';
import path from 'path';

// Mock de serviço de log e eventos para rodar o teste offline sem Prisma caso necessário
class MockLogService {
  async logExecution(data: any) {
    console.log(`[MockLogService] Execution logged: ${data.status}`);
  }
}

class MockEventService {
  async createEvent(source: any, type: string, payload: any) {
    return { eventId: `mock_${Date.now()}`, type, source, payload, receivedAt: new Date() };
  }
  async updateStatus() {}
}

async function testSkillPublisher() {
  console.log('==========================================');
  console.log(' ROTA - Skill Publisher Agent E2E Test ');
  console.log('==========================================\n');

  const eventService = new MockEventService() as any;
  const eventBus = new RotaEventBus(eventService);
  const logService = new MockLogService() as any;
  const dispatcher = new AgentDispatcher(eventBus, logService);
  
  dispatcher.start();

  // Payload de uma skill candidata (proof-verifier)
  const candidateEvent: RotaEvent = {
    eventId: `evt_pubtest_${Date.now()}`,
    type: 'skill.publish_requested',
    source: 'SYSTEM' as any,
    timestamp: new Date().toISOString(),
    payload: {
      id: 'proof-verifier',
      description: 'Verifies Zero-Knowledge proofs for A2A task completion.',
      commandExample: 'curl -X POST /api/skills/proof-verifier/execute -H "Authorization: L402..." -d \'{"proof": "0x123..."}\'',
      pricing: {
        mode: 'paid',
        assetCode: 'USDC',
        amount: '0.50',
        recipientAddress: 'GBUYERTESTACCOUNT...'
      },
      schema: {
        input: {
          type: "object",
          properties: {
            proof: { type: "string" },
            taskId: { type: "string" }
          },
          required: ["proof", "taskId"]
        },
        output: {
          type: "object",
          properties: {
            verified: { type: "boolean" },
            score: { type: "number" }
          }
        }
      }
    }
  };

  console.log('📦 1. Disparando evento: skill.publish_requested');
  eventBus.publish('SYSTEM' as any, candidateEvent.type, candidateEvent.payload);

  // Aguarda processamento
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('\n🔍 2. Validando pacote gerado na pasta /skills/proof-verifier/');
  
  const skillDir = path.resolve(__dirname, '../skills/proof-verifier');
  const expectedFiles = [
    'README.md',
    'skill.md',
    'schema.json',
    'pricing.md',
    'examples/curl.sh'
  ];

  let allValid = true;

  if (!fs.existsSync(skillDir)) {
    console.error(`❌ Diretório base da skill não foi criado: ${skillDir}`);
    allValid = false;
  } else {
    for (const file of expectedFiles) {
      const filePath = path.join(skillDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ Encontrado: ${file}`);
      } else {
        console.error(`   ❌ Ausente: ${file}`);
        allValid = false;
      }
    }
  }

  console.log('\n==========================================');
  if (allValid) {
    console.log('🎉 Teste E2E Finalizado com SUCESSO!');
    console.log('   O Skill Publisher Agent empacotou a capability corretamente.');
  } else {
    console.error('❌ Falha na validação dos artefatos.');
    process.exit(1);
  }
}

testSkillPublisher();
