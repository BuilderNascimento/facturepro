/** Libellés et tarifs fixes (factures France / VeryStay) */

export const FR = {
  menageSejour: 'Ménage pendant le séjour',
  deplacement: 'Déplacement',
  caveRambuteau: 'Cave Rambuteau',
  cavePapin: 'Cave Papin',
  cavesSection: 'Caves',
} as const;

export const TARIF = {
  deplacementTtc: 20,
  deplacementHeures: 1,
  caveTtc: 50,
  caveHeures: 2,
} as const;

export function buildMenageSejourDescription(
  apartmentName: string,
  dateLabel: string,
  detail: string,
  hours: number,
  amountTtc: number
): string {
  const parts = [
    FR.menageSejour,
    apartmentName,
    dateLabel,
    detail || null,
    hours > 0 ? `${hours} h` : null,
    amountTtc > 0 ? `${amountTtc.toFixed(2)} € TTC` : null,
  ].filter(Boolean);
  return parts.join(' — ');
}

export function buildApartmentDeplacementDescription(
  apartmentName: string,
  dateLabel: string,
  detail: string
): string {
  const parts = [
    FR.deplacement,
    apartmentName,
    dateLabel,
    detail || null,
    `${TARIF.deplacementHeures} h`,
    `${TARIF.deplacementTtc.toFixed(2)} € TTC`,
  ].filter(Boolean);
  return parts.join(' — ');
}

export function buildCaveDescription(caveName: string, dateLabel: string): string {
  return [
    FR.cavesSection,
    caveName,
    dateLabel,
    `${TARIF.caveHeures} h`,
    `${TARIF.caveTtc.toFixed(2)} € TTC`,
  ].join(' — ');
}

export function isCaveLine(description: string): boolean {
  return /^caves?\s*—/i.test(description.trim());
}

export function isMenageSejourLine(description: string): boolean {
  return /^ménage pendant le séjour|^menage pendant le sejour/i.test(description.trim());
}

export function isApartmentDeplacementLine(description: string): boolean {
  return /^déplacement\s*—|^deplacement\s*—/i.test(description.trim()) && /\d+\s*h/i.test(description);
}
