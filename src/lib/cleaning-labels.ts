/** Clientes com nomenclatura de limpeza no padrão VeryStay / francês */
export function usesStandardCleaningLabel(companyName?: string | null): boolean {
  if (!companyName) return false;
  return /very\s*stay/i.test(companyName.trim());
}

export function getNormalCleaningLabel(companyName?: string | null): string {
  if (usesStandardCleaningLabel(companyName)) return 'Ménage classique';
  return 'Nettoyage normal';
}

export function isVeryStayClient(companyName?: string | null): boolean {
  return usesStandardCleaningLabel(companyName);
}
