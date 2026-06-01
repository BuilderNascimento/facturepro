/** Lignes « Extra personnel » — formulaire et PDF */

export type PersonnelAssignmentInput = {
  propertyId: string;
  propertyName: string;
  hours: number;
};

export type ExtraPersonnelEntryInput = {
  key: string;
  assignments: PersonnelAssignmentInput[];
  amountTtc: number;
};

export function formatHoursFr(hours: number): string {
  if (!hours || hours <= 0) return '0 h';
  const h = Math.floor(hours);
  const mins = Math.round((hours - h) * 60);
  if (mins === 0) return `${h} h`;
  if (h === 0) return `${mins} min`;
  return `${h} h ${mins}`;
}

export function sumAssignmentHours(assignments: PersonnelAssignmentInput[]): number {
  return assignments.reduce((s, a) => s + (Number(a.hours) || 0), 0);
}

export function buildExtraPersonnelDescription(
  index: number,
  assignments: PersonnelAssignmentInput[],
  amountTtc: number
): string {
  const valid = assignments.filter((a) => a.propertyName && a.hours > 0);
  const aptPart = valid.map((a) => `${a.propertyName} (${formatHoursFr(a.hours)})`).join(' + ');
  const totalH = sumAssignmentHours(valid);
  const parts = [
    'Extra personnel',
    `Extra ${index + 1}`,
    aptPart || null,
    totalH > 0 ? `total ${formatHoursFr(totalH)}` : null,
    amountTtc > 0 ? `${amountTtc.toFixed(2)} € TTC` : null,
  ].filter(Boolean);
  return parts.join(' — ');
}

export type ParsedExtraPersonnel = {
  index: number;
  label: string;
  assignmentsText: string;
  totalHoursText: string;
  amountTtc: number;
};

export function parseExtraPersonnelLine(description: string): ParsedExtraPersonnel | null {
  if (!/^extra\s*personnel/i.test(description.trim())) return null;
  const parts = description.split(' — ').map((p) => p.trim());
  const label = parts[1] ?? 'Extra';
  const indexMatch = label.match(/extra\s*(\d+)/i);
  const index = indexMatch ? Number(indexMatch[1]) : 1;

  let amountTtc = 0;
  const ttcPart = parts.find((p) => /€\s*ttc/i.test(p));
  if (ttcPart) {
    const n = parseFloat(ttcPart.replace(/[^\d,.]/g, '').replace(',', '.'));
    if (!Number.isNaN(n)) amountTtc = n;
  }

  const totalPart = parts.find((p) => /^total\s/i.test(p));
  const assignmentsText = parts.find(
    (p, i) => i >= 2 && !/^total\s/i.test(p) && !/€\s*ttc/i.test(p) && !/^extra\s*\d+/i.test(p)
  ) ?? parts[2] ?? '';

  return {
    index,
    label,
    assignmentsText,
    totalHoursText: totalPart ?? '',
    amountTtc,
  };
}

export function isExtraPersonnelLine(description: string): boolean {
  return parseExtraPersonnelLine(description) !== null;
}
