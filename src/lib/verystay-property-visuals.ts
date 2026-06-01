/**
 * Cores e emojis por imóvel — apenas UI do formulário (VeryStay). O PDF não muda.
 * Ménage classique = quadrado (🟩🟪🟧🟨) · Ménage extra = redondo (🟢🟣🟠🟡)
 */

export type PropertyVisualStyle = {
  /** Emojis quadrados — ménage classique / identidade do imóvel */
  emoji: string;
  /** Emojis redondos — ménage extra */
  emojiExtra: string;
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

const STYLES: Record<string, PropertyVisualStyle> = {
  sparis: {
    emoji: '🟩',
    emojiExtra: '🟢',
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

/** Legenda fixa: regra quadrado / redondo (todos os imóveis) */
export const VERYSTAY_EMOJI_RULE = {
  standardLabel: 'Ménage classique',
  extraLabel: 'Ménage extra',
  standardHint: 'quadrado',
  extraHint: 'redondo',
  standardExample: '🟩 🟪 🟧 🟨',
  extraExample: '🟢 🟣 🟠 🟡',
} as const;
