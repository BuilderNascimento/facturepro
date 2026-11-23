import { describe, expect, it } from 'vitest';
import {
  frenchVatKey,
  isValidFrenchVat,
  isValidSiren,
  isValidSiret,
  luhnValid,
  sirenFromSiret,
} from './identifiers';
import {
  checkBuyerFiscal,
  checkSellerFiscal,
  classifyOperation,
  computeTotals,
  vatDefaults,
} from './rules';

const SIREN = '443061841';
const VAT = `FR${String(frenchVatKey(SIREN)).padStart(2, '0')}${SIREN}`;

describe('identifiers', () => {
  it('valida Luhn', () => {
    expect(luhnValid('79927398713')).toBe(true);
    expect(luhnValid('79927398710')).toBe(false);
    expect(luhnValid('abc')).toBe(false);
  });
  it('valida SIREN', () => {
    expect(isValidSiren(SIREN)).toBe(true);
    expect(isValidSiren('443 061 841')).toBe(true);
    expect(isValidSiren('443061842')).toBe(false);
    expect(isValidSiren('12345')).toBe(false);
  });
  it('valida SIRET e extrai SIREN', () => {
    expect(isValidSiret('35600000000001')).toBe(true); // La Poste (regra especial: soma múltipla de 5)
    expect(isValidSiret('35600000000002')).toBe(false);
    expect(isValidSiret('44306184100047')).toBe(true);
    expect(isValidSiret('44306184100048')).toBe(false);
    expect(isValidSiret('123')).toBe(false);
    expect(sirenFromSiret('35600000000001')).toBe('356000000');
    expect(sirenFromSiret('abc')).toBeNull();
  });
  it('valida N° TVA francês com chave e SIREN', () => {
    expect(isValidFrenchVat(VAT)).toBe(true);
    expect(isValidFrenchVat(VAT.toLowerCase())).toBe(true);
    expect(isValidFrenchVat(VAT, SIREN)).toBe(true);
    expect(isValidFrenchVat(VAT, '356000000')).toBe(false);
    expect(isValidFrenchVat(`FR99${SIREN}`)).toBe(false);
    expect(isValidFrenchVat('')).toBe(false);
  });
});

describe('classificação e TVA', () => {
  it('classifica operações', () => {
    expect(classifyOperation({ country_code: 'FR', client_type: 'business' })).toBe('b2b_domestic');
    expect(classifyOperation({ country_code: 'FR', client_type: 'individual' })).toBe('b2c');
    expect(classifyOperation({ country_code: 'PT', client_type: 'business' })).toBe('b2b_international');
    expect(classifyOperation({})).toBe('b2b_domestic');
  });
  it('franquia: taxa 0 e menção 293 B', () => {
    const d = vatDefaults('franchise');
    expect(d.rate).toBe(0);
    expect(d.exemptionReason).toContain('293 B');
    expect(vatDefaults('real_normal').rate).toBe(20);
  });
});

describe('checkSellerFiscal', () => {
  const base = {
    company_name: 'Ma Société',
    address: '12 rue de la Paix',
    postal_code: '75001',
    city: 'Paris',
    country_code: 'FR',
    siren: SIREN,
  };
  it('franquia não exige N° TVA', () => {
    const issues = checkSellerFiscal({ ...base, vat_regime: 'franchise' });
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('regime real exige N° TVA', () => {
    const issues = checkSellerFiscal({ ...base, vat_regime: 'real_normal' });
    expect(issues.some((i) => i.field === 'vat_number')).toBe(true);
    const ok = checkSellerFiscal({ ...base, vat_regime: 'real_normal', vat_number: VAT });
    expect(ok.filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('regime em falta e SIREN inválido são erros', () => {
    const issues = checkSellerFiscal({ ...base, siren: '123456789' });
    expect(issues.map((i) => i.field)).toEqual(expect.arrayContaining(['siren', 'vat_regime']));
  });
  it('N° TVA de outro SIREN é erro', () => {
    const issues = checkSellerFiscal({ ...base, vat_regime: 'franchise', vat_number: 'FR40303265045' });
    expect(issues.some((i) => i.field === 'vat_number')).toBe(true);
  });
});

describe('checkBuyerFiscal', () => {
  it('B2B em França exige SIREN, mas não N° TVA', () => {
    const issues = checkBuyerFiscal({ company_name: 'Client', address: 'x', country_code: 'FR', client_type: 'business' });
    expect(issues.some((i) => i.field === 'siren' && i.severity === 'error')).toBe(true);
    expect(issues.some((i) => i.field === 'vat_number')).toBe(false);
  });
  it('B2C não exige SIREN', () => {
    const issues = checkBuyerFiscal({ company_name: 'Jean', address: 'x', country_code: 'FR', client_type: 'individual' });
    expect(issues).toEqual([]);
  });
  it('cliente estrangeiro: sem erro de SIREN, aviso de TVA', () => {
    const issues = checkBuyerFiscal({ company_name: 'Cliente PT', address: 'x', country_code: 'PT', client_type: 'business' });
    expect(issues.some((i) => i.severity === 'error')).toBe(false);
    expect(issues.some((i) => i.field === 'vat_number' && i.severity === 'warning')).toBe(true);
  });
});

describe('computeTotals', () => {
  it('soma em cêntimos sem erro de float', () => {
    const t = computeTotals([{ quantity: 3, unit_price: 0.1 }, { quantity: 1, unit_price: 0.2 }], 0);
    expect(t.total_ht_cents).toBe(50);
    expect(t.total_ttc_cents).toBe(50);
  });
  it('TVA por taxa com várias taxas', () => {
    const t = computeTotals(
      [
        { quantity: 1, unit_price: 100 },
        { quantity: 1, unit_price: 50, tva_rate: 10 },
        { quantity: 1, unit_price: 100, tva_rate: 20 },
      ],
      20,
    );
    expect(t.breakdown).toEqual([
      { rate: 10, base_cents: 5000, vat_cents: 500 },
      { rate: 20, base_cents: 20000, vat_cents: 4000 },
    ]);
    expect(t.total_ttc_cents).toBe(25000 + 4500);
  });
  it('linhas negativas (nota de crédito)', () => {
    const t = computeTotals([{ quantity: -2, unit_price: 12.5 }], 20);
    expect(t.total_ht_cents).toBe(-2500);
    expect(t.total_tva_cents).toBe(-500);
  });
});
