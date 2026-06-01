'use client';

import { getVeryStayPropertyVisual, VERYSTAY_EMOJI_RULE } from '@/lib/verystay-property-visuals';

function PropertyEmojis({ emoji, className = '' }: { emoji: string; className?: string }) {
  return (
    <span className={`inline-block text-xl leading-none ${className}`} aria-hidden>
      {emoji}
    </span>
  );
}

interface PropertyOption {
  id: string;
  name: string;
  normal_price: number;
  extra_price: number;
}

interface VeryStayPropertyPickerProps {
  properties: PropertyOption[];
  value: string;
  onChange: (propertyId: string) => void;
}

export function VeryStayPropertyPicker({ properties, value, onChange }: VeryStayPropertyPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
      {properties.map((p) => {
        const visual = getVeryStayPropertyVisual(p.name);
        const selected = value === p.id;
        const cardClass = selected
          ? visual?.cardSelected ?? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300'
          : visual?.cardIdle ?? 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50';

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`text-left rounded-xl border-2 p-3 transition ${cardClass}`}
          >
            <div className="flex items-start gap-2">
              <PropertyEmojis emoji={visual?.emoji ?? '🏠'} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {VERYSTAY_EMOJI_RULE.standardLabel} {Number(p.normal_price).toFixed(0)} € ·{' '}
                  {VERYSTAY_EMOJI_RULE.extraLabel} {Number(p.extra_price).toFixed(0)} €
                </p>
                {visual && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <PropertyEmojis emoji={visual.emojiExtra} className="text-sm" />
                    <span>extras</span>
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function VeryStayColorLegend({ properties }: { properties: PropertyOption[] }) {
  if (!properties.length) return null;

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-4 space-y-2">
      <p className="text-sm font-semibold text-violet-900">
        VeryStay — código de cores por apartamento
      </p>
      <p className="text-xs text-violet-700">
        <strong className="font-medium">{VERYSTAY_EMOJI_RULE.standardLabel}</strong> → emoji{' '}
        <strong>{VERYSTAY_EMOJI_RULE.standardHint}</strong> ({VERYSTAY_EMOJI_RULE.standardExample}) ·{' '}
        <strong className="font-medium">{VERYSTAY_EMOJI_RULE.extraLabel}</strong> → emoji{' '}
        <strong>{VERYSTAY_EMOJI_RULE.extraHint}</strong> ({VERYSTAY_EMOJI_RULE.extraExample})
      </p>
      <p className="text-xs text-violet-600">
        Sparissimo = Sparis + Live · Gaite = Lyrique + Sweet Paris
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {properties.map((p) => {
          const visual = getVeryStayPropertyVisual(p.name);
          return (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/90 border border-violet-100 rounded-full px-2.5 py-1 text-slate-700"
            >
              <PropertyEmojis emoji={visual?.emoji ?? '🏠'} className="text-base" />
              <span className="text-slate-400">/</span>
              <PropertyEmojis emoji={visual?.emojiExtra ?? '⚪'} className="text-base" />
              <span className="ml-0.5">{p.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
