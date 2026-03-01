export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface CompanySettings {
  id: string;
  company_name: string;
  legal_status: string | null;
  siret: string | null;
  ape_naf: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  iban: string | null;
  bic: string | null;
  bank_name: string | null;
  vat_number: string | null;
  default_payment_terms: number;
  late_penalty_rate: number;
  legal_text_default: string | null;
  indemnity_text_default: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  siret: string | null;
  vat_number: string | null;
  notes: string | null;
  created_at: string;
}

export type ServiceUnitType = 'hora' | 'serviço' | 'pacote' | 'mensal';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  unit_type: ServiceUnitType;
  created_at: string;
}

export interface Property {
  id: string;
  client_id: string;
  name: string;
  address: string | null;
  normal_price: number;
  extra_price: number;
  notes: string | null;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  tva_rate: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  pdf_url: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceWithClient extends Invoice {
  clients: Client | null;
}

export interface InvoiceWithDetails extends Invoice {
  clients: Client | null;
  invoice_items: (InvoiceItem & { services: Service | null })[];
}
