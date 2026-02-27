import type { CompanySettings } from '@/lib/types/database';

export const demoSettings: CompanySettings = {
  id: 'demo-settings',
  company_name: 'Mon Entreprise',
  legal_status: 'Auto-entrepreneur',
  siret: '',
  address: '',
  email: '',
  phone: '',
  iban: '',
  bic: '',
  vat_number: null,
  default_payment_terms: 30,
  late_penalty_rate: 0,
  legal_text_default: 'TVA non applicable, art. 293B du CGI',
  indemnity_text_default: 'Indemnité forfaitaire de 40€ pour frais de recouvrement',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
