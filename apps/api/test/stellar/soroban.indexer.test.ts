import { SorobanIndexer } from '../../src/stellar/soroban.indexer';
import { RotaEventBus } from '../../src/events/event-bus';
import * as StellarSdk from '@stellar/stellar-sdk';

// Mock RotaEventBus
class MockRotaEventBus extends RotaEventBus {
  constructor() {
    super({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      silent: jest.fn(),
    } as any); // Mock de um logger Fastify
  }
  async publish(channel: any, eventName: string, payload: any): Promise<string> {
    // console.log(`[MockRotaEventBus] Published: ${channel}, ${eventName}, ${JSON.stringify(payload)}`);
    return Promise.resolve('mock-event-id');
  }
}

describe('SorobanIndexer decodeTopicName', () => {
  let sorobanIndexer: SorobanIndexer;
  let mockEventBus: MockRotaEventBus;

  beforeAll(() => {
    mockEventBus = new MockRotaEventBus();
    sorobanIndexer = new SorobanIndexer(mockEventBus);
  });

  // Helper para criar tópicos simulados
  const createMockTopics = (domain: string, eventName: string): string[] => {
    const domainScVal = StellarSdk.xdr.ScVal.scvSymbol(domain);
    const eventNameScVal = StellarSdk.xdr.ScVal.scvSymbol(eventName);
    return [domainScVal.toXDR('base64'), eventNameScVal.toXDR('base64')];
  };

  it('should decode "ESCROW.INIT" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'INIT');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.initialized');
  });

  it('should decode "ESCROW.BOND" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'BOND');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.bonded');
  });

  it('should decode "ESCROW.PROOF" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'PROOF');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.proof_submitted');
  });

  it('should decode "ESCROW.SETTLED" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'SETTLED');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.settled');
  });

  it('should decode "ESCROW.SLASHED" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'SLASHED');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.slashed');
  });

  it('should decode "ESCROW.CANCEL" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'CANCEL');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.cancelled');
  });

  it('should decode "ESCROW.DISPUTED" topic correctly', () => {
    const topics = createMockTopics('ESCROW', 'DISPUTED');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.disputed');
  });

  it('should decode "SECURITY.INTRUSION" topic correctly', () => {
    const topics = createMockTopics('SECURITY', 'INTRUSION');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('security.intrusion_detected');
  });

  it('should return null for unknown domain topics', () => {
    const topics = createMockTopics('UNKNOWN', 'EVENT');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBeNull();
  });

  it('should return null for unknown escrow event names', () => {
    const topics = createMockTopics('ESCROW', 'UNKNOWN_EVENT');
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBe('escrow.unknown_event'); // Default case
  });

  it('should return null for empty topics array', () => {
    const decodedName = (sorobanIndexer as any).decodeTopicName([]);
    expect(decodedName).toBeNull();
  });

  it('should return null for topics array with less than 2 elements', () => {
    const topics = [StellarSdk.xdr.ScVal.scvSymbol('ESCROW').toXDR('base64')];
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBeNull();
  });

  it('should handle invalid XDR format gracefully', () => {
    const topics = ['invalid-xdr', 'invalid-xdr'];
    const decodedName = (sorobanIndexer as any).decodeTopicName(topics);
    expect(decodedName).toBeNull();
  });
});