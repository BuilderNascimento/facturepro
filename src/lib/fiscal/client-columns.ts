import { sirenFromSiret } from './identifiers';
import type { ClientInput } from '@/lib/validations/schemas';

/** Colunas fiscais da tabela `clients` derivadas do input validado. */
export function clientFiscalColumns(data: ClientInput) {
  return {
    client_type: data.client_type ?? 'business',
    country_code: data.country_code ?? 'FR',
    postal_code: data.postal_code?.trim() || null,
    city: data.city?.trim() || null,
    siren: sirenFromSiret(data.siret),
  };
}
