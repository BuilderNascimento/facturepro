import { z } from 'zod';

const unitTypeEnum = z.enum(['hora', 'serviço', 'pacote', 'mensal']);
const statusEnum = z.enum(['draft', 'sent', 'paid', 'overdue']);

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Nom obligatoire'),
  legal_status: z.string().optional(),
  siret: z.string().optional(),
  ape_naf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bank_name: z.string().optional(),
  vat_number: z.string().optional(),
  default_payment_terms: z.coerce.number().int().min(0),
  late_penalty_rate: z.coerce.number().min(0).max(100),
  legal_text_default: z.string().optional(),
  indemnity_text_default: z.string().optional(),
});

export const clientSchema = z.object({
  company_name: z.string().min(1, 'Nom obligatoire'),
  contact_name: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  siret: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nom obligatoire'),
  description: z.string().optional(),
  unit_price: z.coerce.number().min(0),
  unit_type: unitTypeEnum,
});

export const propertySchema = z.object({
  client_id: z.string().min(1, 'Propriétaire obligatoire'),
  name: z.string().min(1, 'Nom de l\'appartement obligatoire'),
  address: z.string().optional(),
  normal_price: z.coerce.number().min(0, 'Prix obligatoire'),
  extra_price: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  service_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'Description obligatoire'),
  quantity: z.coerce.number().positive(),
  unit_price: z.coerce.number().min(0),
}).refine(
  (data) => Math.round((data.quantity * data.unit_price) * 100) / 100 >= 0,
  { message: 'Total invalide' }
);

export const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Cliente obrigatório'),
  issue_date: z.string().min(1, 'Data de emissão obrigatória'),
  due_date: z.string().min(1, 'Data de vencimento obrigatória'),
  status: statusEnum.default('draft'),
  tva_rate: z.coerce.number().min(0).max(100).default(0),
  description: z.string().max(5000).optional().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'Au moins une ligne'),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
