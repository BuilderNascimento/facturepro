/**
 * Cores e emojis por imóvel (VeryStay) — formulário e PDF.
 * Ménage classique = quadrado (🟩🟪🟧🟨) · Ménage extra = redondo (🟢🟣🟠🟡)
 */

export type PropertyPdfColors = {
  emoji: string;
  rowBg: string;
  rowBorder: string;
  headerBg: string;
  text: string;
};

export type PropertyVisualStyle = {
  /** Emojis quadrados — ménage classique / identidade do imóvel */
  emoji: string;
  /** Emojis redondos — ménage extra */
  emojiExtra: string;
  pdf: PropertyPdfColors;
  pdfExtra: PropertyPdfColors;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  cardSelected: string;
  cardIdle: string;
  normalBorder: string;
  normalBg: string;
  normalHeaderText: string;
  extraBorder: string;
  extraBg: string;
  extraHeaderText: string;
};

const PDF_GREEN: PropertyPdfColors = {
  emoji: '🟩',
  rowBg: '#f0fdf4',
  rowBorder: '#22c55e',
  headerBg: '#dcfce7',
  text: '#14532d',
};
const PDF_GREEN_EXTRA: PropertyPdfColors = {
  emoji: '🟢',
  rowBg: '#ecfdf5',
  rowBorder: '#16a34a',
  headerBg: '#bbf7d0',
  text: '#166534',
};
const PDF_PURPLE: PropertyPdfColors = {
  emoji: '🟪',
  rowBg: '#faf5ff',
  rowBorder: '#a855f7',
  headerBg: '#f3e8ff',
  text: '#581c87',
};
const PDF_PURPLE_EXTRA: PropertyPdfColors = {
  emoji: '🟣',
  rowBg: '#f5f3ff',
  rowBorder: '#9333ea',
  headerBg: '#ede9fe',
  text: '#5b21b6',
};
const PDF_ORANGE: PropertyPdfColors = {
  emoji: '🟧',
  rowBg: '#fff7ed',
  rowBorder: '#f97316',
  headerBg: '#ffedd5',
  text: '#9a3412',
};
const PDF_ORANGE_EXTRA: PropertyPdfColors = {
  emoji: '🟠',
  rowBg: '#fffbeb',
  rowBorder: '#ea580c',
  headerBg: '#fed7aa',
  text: '#c2410c',
};
const PDF_AMBER: PropertyPdfColors = {
  emoji: '🟨',
  rowBg: '#fefce8',
  rowBorder: '#eab308',
  headerBg: '#fef9c3',
  text: '#854d0e',
};
const PDF_AMBER_EXTRA: PropertyPdfColors = {
  emoji: '🟡',
  rowBg: '#fffbeb',
  rowBorder: '#ca8a04',
  headerBg: '#fde68a',
  text: '#a16207',
};

const STYLES: Record<string, PropertyVisualStyle> = {
  sparis: {
    emoji: '🟩',
    emojiExtra: '🟢',
    pdf: PDF_GREEN,
    pdfExtra: PDF_GREEN_EXTRA,
    headerBg: 'bg-green-50',
    headerBorder: 'border-green-400',
    headerText: 'text-green-900',
    cardSelected: 'border-green-500 bg-green-50 ring-2 ring-green-300',
    cardIdle: 'border-green-200 bg-white hover:border-green-400 hover:bg-green-50/50',
    normalBorder: 'border-green-200',
    normalBg: 'bg-green-50/80',
    normalHeaderText: 'text-green-900',
    extraBorder: 'border-green-300',
    extraBg: 'bg-green-100/60',
    extraHeaderText: 'text-green-800',
  },
  lyrique: {
    emoji: '🟪',
    emojiExtra: '🟣',
    pdf: PDF_PURPLE,
    pdfExtra: PDF_PURPLE_EXTRA,
    headerBg: 'bg-purple-50',
    headerBorder: 'border-purple-400',
    headerText: 'text-purple-900',
    cardSelected: 'border-purple-500 bg-purple-50 ring-2 ring-purple-300',
    cardIdle: 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50/50',
    normalBorder: 'border-purple-200',
    normalBg: 'bg-purple-50/80',
    normalHeaderText: 'text-purple-900',
    extraBorder: 'border-purple-300',
    extraBg: 'bg-purple-100/60',
    extraHeaderText: 'text-purple-800',
  },
  parislive: {
    emoji: '🟧',
    emojiExtra: '🟠',
    pdf: PDF_ORANGE,
    pdfExtra: PDF_ORANGE_EXTRA,
    headerBg: 'bg-orange-50',
    headerBorder: 'border-orange-400',
    headerText: 'text-orange-900',
    cardSelected: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300',
    cardIdle: 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50/50',
    normalBorder: 'border-orange-200',
    normalBg: 'bg-orange-50/80',
    normalHeaderText: 'text-orange-900',
    extraBorder: 'border-orange-300',
    extraBg: 'bg-orange-100/60',
    extraHeaderText: 'text-orange-800',
  },
  sweetparis: {
    emoji: '🟨',
    emojiExtra: '🟡',
    pdf: PDF_AMBER,
    pdfExtra: PDF_AMBER_EXTRA,
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-400',
    headerText: 'text-amber-900',
    cardSelected: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300',
    cardIdle: 'border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/50',
    normalBorder: 'border-amber-200',
    normalBg: 'bg-amber-50/80',
    normalHeaderText: 'text-amber-900',
    extraBorder: 'border-amber-300',
    extraBg: 'bg-amber-100/60',
    extraHeaderText: 'text-amber-800',
  },
  /** Sparis + Paris Live */
  sparissimo: {
    emoji: '🟩🟧',
    emojiExtra: '🟢🟠',
    pdf: {
      emoji: '🟩🟧',
      rowBg: 'linear-gradient(90deg, #f0fdf4 0%, #fff7ed 100%)',
      rowBorder: '#22c55e',
      headerBg: 'linear-gradient(90deg, #dcfce7 0%, #ffedd5 100%)',
      text: '#14532d',
    },
    pdfExtra: {
      emoji: '🟢🟠',
      rowBg: 'linear-gradient(90deg, #ecfdf5 0%, #fffbeb 100%)',
      rowBorder: '#ea580c',
      headerBg: 'linear-gradient(90deg, #bbf7d0 0%, #fed7aa 100%)',
      text: '#9a3412',
    },
    headerBg: 'bg-gradient-to-r from-green-50 via-amber-50/30 to-orange-50',
    headerBorder: 'border-green-400',
    headerText: 'text-slate-900',
    cardSelected:
      'border-green-500 bg-gradient-to-br from-green-50 to-orange-50 ring-2 ring-orange-300',
    cardIdle:
      'border-slate-200 bg-white hover:border-orange-300 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-orange-50/50',
    normalBorder: 'border-green-300',
    normalBg: 'bg-gradient-to-r from-green-50/90 to-orange-50/50',
    normalHeaderText: 'text-green-900',
    extraBorder: 'border-orange-300',
    extraBg: 'bg-gradient-to-r from-green-100/50 to-orange-100/50',
    extraHeaderText: 'text-orange-900',
  },
  /** Lyrique + Sweet Paris */
  gaiteparis: {
    emoji: '🟪🟨',
    emojiExtra: '🟣🟡',
    pdf: {
      emoji: '🟪🟨',
      rowBg: 'linear-gradient(90deg, #faf5ff 0%, #fefce8 100%)',
      rowBorder: '#a855f7',
      headerBg: 'linear-gradient(90deg, #f3e8ff 0%, #fef9c3 100%)',
      text: '#581c87',
    },
    pdfExtra: {
      emoji: '🟣🟡',
      rowBg: 'linear-gradient(90deg, #f5f3ff 0%, #fffbeb 100%)',
      rowBorder: '#ca8a04',
      headerBg: 'linear-gradient(90deg, #ede9fe 0%, #fde68a 100%)',
      text: '#854d0e',
    },
    headerBg: 'bg-gradient-to-r from-purple-50 via-violet-50/30 to-amber-50',
    headerBorder: 'border-purple-400',
    headerText: 'text-slate-900',
    cardSelected:
      'border-purple-500 bg-gradient-to-br from-purple-50 to-amber-50 ring-2 ring-amber-300',
    cardIdle:
      'border-slate-200 bg-white hover:border-amber-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-amber-50/50',
    normalBorder: 'border-purple-300',
    normalBg: 'bg-gradient-to-r from-purple-50/90 to-amber-50/50',
    normalHeaderText: 'text-purple-900',
    extraBorder: 'border-amber-300',
    extraBg: 'bg-gradient-to-r from-purple-100/50 to-amber-100/50',
    extraHeaderText: 'text-amber-900',
  },
};

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolveStyleKey(name: string): string | null {
  const key = normalizeKey(name);
  if (STYLES[key]) return key;

  if (key.includes('sparissimo')) return 'sparissimo';
  if (key.includes('sparis')) return 'sparis';
  if (key.includes('gaite')) return 'gaiteparis';
  if (key.includes('lyrique')) return 'lyrique';
  if (key.includes('parislive') || (key.includes('paris') && key.includes('live'))) return 'parislive';
  if (key.includes('sweet')) return 'sweetparis';

  return null;
}

export function getVeryStayPropertyVisual(propertyName: string): PropertyVisualStyle | null {
  const styleKey = resolveStyleKey(propertyName);
  return styleKey ? STYLES[styleKey] : null;
}

export function formatPropertyOptionLabel(propertyName: string): string {
  const visual = getVeryStayPropertyVisual(propertyName);
  if (!visual) return propertyName;
  return `${visual.emoji} ${propertyName}`;
}

export function getVeryStayPdfColors(
  propertyName: string,
  isExtra: boolean
): PropertyPdfColors | null {
  const visual = getVeryStayPropertyVisual(propertyName);
  if (!visual) return null;
  return isExtra ? visual.pdfExtra : visual.pdf;
}

export type ParsedVeryStayLine = {
  label: string;
  propertyName: string | null;
  datesText: string;
  isExtra: boolean;
  isCleaning: boolean;
};

/** Linhas geradas pelo formulário: "Ménage classique — Sparis — 01 juin., …" */
export function parseVeryStayLineItem(description: string): ParsedVeryStayLine {
  if (/^extra\s*personnel/i.test(description.trim())) {
    return {
      label: description,
      propertyName: null,
      datesText: '',
      isExtra: false,
      isCleaning: false,
    };
  }
  if (
    /^ménage pendant le séjour|^menage pendant le sejour|^caves?\s*—|^déplacement\s*—|^deplacement\s*—/i.test(
      description.trim()
    )
  ) {
    return {
      label: description,
      propertyName: null,
      datesText: '',
      isExtra: false,
      isCleaning: false,
    };
  }
  const parts = description.split(' — ').map((p) => p.trim()).filter(Boolean);
  const label = parts[0] ?? description;
  const isExtra = /extra/i.test(label);
  const isCleaning =
    /ménage|menage|nettoyage/i.test(label) && !/déplacement|deplacement|heures/i.test(label);

  if (parts.length >= 3 && isCleaning) {
    return {
      label,
      propertyName: parts[1],
      datesText: parts.slice(2).join(' — '),
      isExtra,
      isCleaning: true,
    };
  }

  return {
    label,
    propertyName: null,
    datesText: parts.length > 1 ? parts.slice(1).join(' — ') : '',
    isExtra,
    isCleaning,
  };
}

export function extractPropertyNamesFromItems(items: { description: string }[]): { name: string }[] {
  const names = new Set<string>();
  for (const item of items) {
    const parsed = parseVeryStayLineItem(item.description);
    if (parsed.propertyName) names.add(parsed.propertyName);
  }
  return [...names].map((name) => ({ name }));
}

/** Legenda fixa: regra quadrado / redondo (todos os imóveis) */
export const VERYSTAY_EMOJI_RULE = {
  standardLabel: 'Ménage classique',
  extraLabel: 'Ménage extra',
  standardHint: 'quadrado',
  extraHint: 'redondo',
  standardExample: '🟩 🟪 🟧 🟨',
  extraExample: '🟢 🟣 🟠 🟡',
} as const;
