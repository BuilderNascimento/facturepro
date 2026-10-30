/** Lignes du mode Facture — encodage / parsing pour le PDF en colonnes */

export type FactureKind = 'Ménage' | 'Accueil' | 'Pick-up';

export type FactureLineInput = {
  date: string;
  local: string;
  startTime: string;
  endTime: string;
  amount: number;
};

const PREFIX = 'FACT';

/** Description stockée : FACT::Ménage::2026-09-03::10:00::14:00::Canal St Martin */
export function encodeFactureLine(kind: FactureKind, line: FactureLineInput): string {
  const parts = [
    PREFIX,
    kind,
    line.date || '',
    line.startTime || '',
    line.endTime || '',
    (line.local || '').replace(/::/g, ' '),
  ];
  return parts.join('::');
}

export type ParsedFactureLine = {
  kind: FactureKind;
  date: string;
  startTime: string;
  endTime: string;
  local: string;
};

export function parseFactureLine(description: string): ParsedFactureLine | null {
  const raw = description.trim();
  if (!raw.startsWith(`${PREFIX}::`)) {
    // Compat anciennes lignes "Ménage — local — date — heures"
    const legacy = raw.match(/^(Ménage|Accueil|Pick-up)\s*—\s*(.+)$/i);
    if (!legacy) return null;
    const kind = normalizeKind(legacy[1]);
    if (!kind) return null;
    const rest = legacy[2].split(/\s*—\s*/).map((s) => s.trim());
    return {
      kind,
      local: rest[0] || '',
      date: '',
      startTime: '',
      endTime: '',
    };
  }

  const parts = raw.split('::');
  if (parts.length < 6) return null;
  const kind = normalizeKind(parts[1]);
  if (!kind) return null;
  return {
    kind,
    date: parts[2] || '',
    startTime: parts[3] || '',
    endTime: parts[4] || '',
    local: parts.slice(5).join('::').trim(),
  };
}

function normalizeKind(s: string): FactureKind | null {
  const t = s.trim().toLowerCase();
  if (t === 'ménage' || t === 'menage') return 'Ménage';
  if (t === 'accueil') return 'Accueil';
  if (t === 'pick-up' || t === 'pickup') return 'Pick-up';
  return null;
}

export function isFactureInvoiceItems(items: { description: string }[]): boolean {
  return items.some((i) => parseFactureLine(i.description) !== null);
}

export function formatHoursDisplay(start: string, end: string): string {
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return '—';
}

export function formatDateFr(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function durationLabel(start: string, end: string): string {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return '';
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h00`;
  return `${h}h${String(m).padStart(2, '0')}`;
}
