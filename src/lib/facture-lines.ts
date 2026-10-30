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

/** Mois FR (date-fns 'MMM' : "oct.", "janv.", "févr.", …) */
const FR_MONTHS: Record<string, number> = {
  jan: 1, janv: 1,
  fev: 2, févr: 2, fevr: 2,
  mar: 3, mars: 3,
  avr: 4,
  mai: 5,
  juin: 6,
  juil: 7, juill: 7,
  aou: 8, aoû: 8, aout: 8, août: 8,
  sep: 9, sept: 9,
  oct: 10,
  nov: 11,
  dec: 12, déc: 12,
};

/** Convertit une date FR courte (03 oct.), FR longue (03/09/2026) ou ISO → yyyy-mm-dd */
function toIsoDate(s: string, defaultYear: number): string {
  const t = s.trim();
  const fr = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  // "03 oct." / "3 oct" / "05 févr." (ancien formatFactureLineDescription)
  const short = t.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\.?$/u);
  if (short) {
    const day = parseInt(short[1], 10);
    const monKey = short[2]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\.$/, '');
    // essayer clé exacte puis préfixe 3–4 lettres
    const month =
      FR_MONTHS[monKey] ||
      FR_MONTHS[monKey.slice(0, 4)] ||
      FR_MONTHS[monKey.slice(0, 3)];
    if (month && day >= 1 && day <= 31) {
      return `${defaultYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return '';
}

function parseLegacyHours(s: string): { startTime: string; endTime: string } {
  const t = s.trim();
  // "10:00 – 14:00" / "10:00-14:00" / tirets unicode
  const range = t.match(/(\d{1,2}:\d{2})\s*[–—−\-]\s*(\d{1,2}:\d{2})/);
  if (range) {
    return {
      startTime: range[1].padStart(5, '0'),
      endTime: range[2].padStart(5, '0'),
    };
  }
  const one = t.match(/^(\d{1,2}:\d{2})$/);
  if (one) return { startTime: one[1].padStart(5, '0'), endTime: '' };
  return { startTime: '', endTime: '' };
}

function splitLegacyParts(rest: string): string[] {
  // Séparateur de champs = tiret long " — " (U+2014).
  // Ne pas couper sur " – " (U+2013) : c'est le séparateur d'heures "10:00 – 14:00".
  return rest
    .split(/\s*—\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseFactureLine(
  description: string,
  defaultYear: number = new Date().getFullYear()
): ParsedFactureLine | null {
  const raw = description.trim();
  if (!raw.startsWith(`${PREFIX}::`)) {
    // Compat anciennes lignes "Ménage — local — 03 oct. — 10:00 – 14:00"
    const legacy = raw.match(/^(Ménage|Menage|Accueil|Pick-up|Pickup)\s*[—–−\-]\s*(.+)$/i);
    if (!legacy) return null;
    const kind = normalizeKind(legacy[1]);
    if (!kind) return null;
    const rest = splitLegacyParts(legacy[2]);

    let local = '';
    let date = '';
    let startTime = '';
    let endTime = '';

    for (const part of rest) {
      const iso = toIsoDate(part, defaultYear);
      if (iso && !date) {
        date = iso;
        continue;
      }
      const hours = parseLegacyHours(part);
      if ((hours.startTime || hours.endTime) && !startTime) {
        startTime = hours.startTime;
        endTime = hours.endTime;
        continue;
      }
      if (!local) local = part;
      else local = `${local} — ${part}`;
    }

    return { kind, local, date, startTime, endTime };
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
