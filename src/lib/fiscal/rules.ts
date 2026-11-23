// Regras fiscais base (Fase 2). Independente de qualquer PA.
//
// ATENÇÃO: as listas de campos obrigatórios abaixo seguem as menções legais
// francesas conhecidas (art. 242 nonies A, annexe II do CGI e a reforma da
// facturation électronique). Devem ser conferidas contra as normas XP Z12-012
// (formatos) antes de qualquer transmissão real — ver Fase 3.

import { isValidFrenchVat, isValidSiren, isValidSiret, digitsOnly, sirenFromSiret } from './identifiers';

export type VatRegime = 'franchise' | 'real_simplified' | 'real_normal';
export type OperationCategory = 'services' | 'goods' | 'mixed';
export type ClientType = 'business' | 'individual';

/** Classificação da operação, usada para decidir entre e-invoicing e e-reporting. */
export type OperationKind =
  | 'b2b_domestic' // empresa → empresa estabelecida em França: e-invoicing
  | 'b2c' // particular: e-reporting
  | 'b2b_international'; // cliente de outro país: e-reporting

export interface SellerFiscal {
  company_name?: string | null;
  siret?: string | null;
  siren?: string | null;
  vat_number?: string | null;
  vat_regime?: VatRegime | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country_code?: string | null;
}

export interface BuyerFiscal {
  company_name?: string | null;
  client_type?: ClientType | null;
  siret?: string | null;
  siren?: string | null;
  vat_number?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country_code?: string | null;
}

export interface FiscalIssue {
  field: string;
  message: string;
  /** error = impede a transmissão; warning = aviso. */
  severity: 'error' | 'warning';
}

export const FRANCHISE_EXEMPTION_TEXT = 'TVA non applicable, art. 293 B du CGI';

export function classifyOperation(buyer: BuyerFiscal, sellerCountry = 'FR'): OperationKind {
  const country = (buyer.country_code ?? 'FR').toUpperCase();
  if (country !== sellerCountry.toUpperCase()) return 'b2b_international';
  if (buyer.client_type === 'individual') return 'b2c';
  return 'b2b_domestic';
}

/** Taxa e menção por defeito de uma fatura, conforme o regime de TVA do emitente. */
export function vatDefaults(regime: VatRegime | null | undefined): {
  rate: number;
  exemptionReason: string | null;
} {
  if (regime === 'franchise') return { rate: 0, exemptionReason: FRANCHISE_EXEMPTION_TEXT };
  return { rate: 20, exemptionReason: null };
}

function blank(v: string | null | undefined): boolean {
  return !v || !v.trim();
}

export function checkSellerFiscal(seller: SellerFiscal): FiscalIssue[] {
  const issues: FiscalIssue[] = [];
  const err = (field: string, message: string) => issues.push({ field, message, severity: 'error' });
  const warn = (field: string, message: string) => issues.push({ field, message, severity: 'warning' });

  if (blank(seller.company_name)) err('company_name', 'Razão social em falta');
  if (blank(seller.address)) err('address', 'Endereço fiscal em falta');
  if (blank(seller.postal_code)) err('postal_code', 'Código postal em falta');
  if (blank(seller.city)) err('city', 'Cidade em falta');
  if (blank(seller.country_code)) err('country_code', 'País em falta');

  const siren = seller.siren || sirenFromSiret(seller.siret);
  if (blank(siren)) err('siren', 'SIREN em falta');
  else if (!isValidSiren(siren)) err('siren', 'SIREN inválido');

  if (!blank(seller.siret) && !isValidSiret(seller.siret)) err('siret', 'SIRET inválido');

  if (!seller.vat_regime) {
    err('vat_regime', 'Regime de TVA não definido');
  } else if (seller.vat_regime === 'franchise') {
    // Franquia: o N° TVA não é exigido. Se existir, não é erro.
  } else if (blank(seller.vat_number)) {
    err('vat_number', 'N° TVA intracomunitário obrigatório fora da franquia em base');
  }
  if (!blank(seller.vat_number) && !isValidFrenchVat(seller.vat_number, siren)) {
    err('vat_number', 'N° TVA inválido ou não corresponde ao SIREN');
  }
  return issues;
}

export function checkBuyerFiscal(buyer: BuyerFiscal, sellerCountry = 'FR'): FiscalIssue[] {
  const issues: FiscalIssue[] = [];
  const err = (field: string, message: string) => issues.push({ field, message, severity: 'error' });
  const warn = (field: string, message: string) => issues.push({ field, message, severity: 'warning' });
  const kind = classifyOperation(buyer, sellerCountry);

  if (blank(buyer.company_name)) err('company_name', 'Nome do cliente em falta');
  if (blank(buyer.address)) err('address', 'Endereço de faturação em falta');
  if (blank(buyer.country_code)) err('country_code', 'País do cliente em falta');

  if (kind === 'b2b_domestic') {
    const siren = buyer.siren || sirenFromSiret(buyer.siret);
    if (blank(siren)) err('siren', 'SIREN do cliente obrigatório em operações B2B em França');
    else if (!isValidSiren(siren)) err('siren', 'SIREN do cliente inválido');
    if (!blank(buyer.siret) && !isValidSiret(buyer.siret)) err('siret', 'SIRET do cliente inválido');
    // N° TVA do cliente: não é obrigatório para fatura doméstica; só validamos se preenchido.
    if (!blank(buyer.vat_number) && !isValidFrenchVat(buyer.vat_number, siren)) {
      warn('vat_number', 'N° TVA do cliente com formato ou chave inválidos');
    }
  }
  if (kind === 'b2b_international' && blank(buyer.vat_number)) {
    warn('vat_number', 'N° TVA do cliente em falta (pode ser exigido em operações intracomunitárias)');
  }
  return issues;
}

// ---- Totais (cêntimos inteiros, sem erros de ponto flutuante) ----

export interface TotalsLine {
  quantity: number;
  unit_price: number;
  /** null/undefined = usa `defaultRate`. */
  tva_rate?: number | null;
}

export interface VatBreakdown {
  rate: number;
  base_cents: number;
  vat_cents: number;
}

export interface InvoiceTotals {
  total_ht_cents: number;
  total_tva_cents: number;
  total_ttc_cents: number;
  breakdown: VatBreakdown[];
}

export function computeTotals(lines: TotalsLine[], defaultRate: number): InvoiceTotals {
  const byRate = new Map<number, number>();
  for (const l of lines) {
    const rate = l.tva_rate ?? defaultRate;
    const lineCents = Math.round(l.quantity * l.unit_price * 100);
    byRate.set(rate, (byRate.get(rate) ?? 0) + lineCents);
  }
  // O IVA calcula-se por taxa sobre a base agregada (arredondado uma vez por taxa).
  const breakdown: VatBreakdown[] = [...byRate.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rate, base]) => ({ rate, base_cents: base, vat_cents: Math.round((base * rate) / 100) }));
  const ht = breakdown.reduce((s, b) => s + b.base_cents, 0);
  const tva = breakdown.reduce((s, b) => s + b.vat_cents, 0);
  return { total_ht_cents: ht, total_tva_cents: tva, total_ttc_cents: ht + tva, breakdown };
}

export { digitsOnly };
