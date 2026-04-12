import { RawSorobanEvent, NormalizedDomainEvent } from './contract-events.types';
export declare class ContractEventsMapper {
    /**
     * Converte um evento nativo do Soroban em um evento de domínio normalizado
     * que o backend da ROTA possa entender e conciliar.
     */
    static mapToDomain(raw: RawSorobanEvent): NormalizedDomainEvent | null;
    private static decodeTopicString;
}
//# sourceMappingURL=contract-events.mapper.d.ts.map