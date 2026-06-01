import { getVeryStayPropertyVisual } from '@/lib/verystay-property-visuals';

/** Clientes com nomenclatura de limpeza no padrão VeryStay / francês */
export function usesStandardCleaningLabel(companyName?: string | null): boolean {
  return isVeryStayClient(companyName);
}

export function getNormalCleaningLabel(companyName?: string | null): string {
  if (usesStandardCleaningLabel(companyName)) return 'Ménage classique';
  return 'Nettoyage normal';
}

/** Nome da empresa (tolera VeryStay, VERY STAY, SAS VeryStay, etc.) */
export function isVeryStayClient(companyName?: string | null): boolean {
  if (!companyName) return false;
  const normalized = companyName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalized.includes('verystay') || normalized.includes('very stay');
}

/** Imóveis típicos VeryStay (Sparis, Lyrique, ParisLive…) — fallback se o nome do cliente variar */
export function hasVeryStayPropertySet(properties: { name: string }[]): boolean {
  if (properties.length < 2) return false;
  const known = properties.filter((p) => getVeryStayPropertyVisual(p.name));
  return known.length >= 2;
}

export function isVeryStayInvoiceContext(
  companyName?: string | null,
  properties: { name: string }[] = []
): boolean {
  return isVeryStayClient(companyName) || hasVeryStayPropertySet(properties);
}
