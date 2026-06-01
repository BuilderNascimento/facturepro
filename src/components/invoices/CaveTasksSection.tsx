'use client';

import { Warehouse } from 'lucide-react';
import { FR, TARIF } from '@/lib/invoice-french-services';
import { formatDateLabel } from '@/lib/invoice-form-utils';

export interface CaveTaskState {
  rambuteau: { enabled: boolean; date: string };
  papin: { enabled: boolean; date: string };
}

interface CaveTasksSectionProps {
  caves: CaveTaskState;
  onChange: (caves: CaveTaskState) => void;
}

const INPUT =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';

function CaveRow({
  id,
  label,
  enabled,
  date,
  onToggle,
  onDate,
}: {
  id: string;
  label: string;
  enabled: boolean;
  date: string;
  onToggle: (v: boolean) => void;
  onDate: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-3 space-y-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded border-stone-400 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-semibold text-stone-800">{label}</span>
        <span className="text-xs text-stone-500 ml-auto">
          {TARIF.caveHeures} h · {TARIF.caveTtc.toFixed(2)} € TTC
        </span>
      </label>
      {enabled && (
        <div>
          <label htmlFor={`${id}-date`} className="block text-xs text-stone-600 mb-0.5">
            Date de l&apos;intervention
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`${id}-date`}
              type="date"
              value={date}
              onChange={(e) => onDate(e.target.value)}
              className={INPUT}
            />
            {date && (
              <span className="text-xs text-stone-500 whitespace-nowrap">{formatDateLabel(date)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CaveTasksSection({ caves, onChange }: CaveTasksSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 border-b border-stone-200">
        <Warehouse className="w-4 h-4 text-stone-700" />
        <h3 className="font-semibold text-sm text-stone-900">{FR.cavesSection}</h3>
        <span className="text-xs text-stone-600 hidden sm:inline">
          — tâches réservées (2 h · 50 € TTC par cave)
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CaveRow
          id="cave-rambuteau"
          label={FR.caveRambuteau}
          enabled={caves.rambuteau.enabled}
          date={caves.rambuteau.date}
          onToggle={(v) => onChange({ ...caves, rambuteau: { ...caves.rambuteau, enabled: v } })}
          onDate={(d) => onChange({ ...caves, rambuteau: { ...caves.rambuteau, date: d } })}
        />
        <CaveRow
          id="cave-papin"
          label={FR.cavePapin}
          enabled={caves.papin.enabled}
          date={caves.papin.date}
          onToggle={(v) => onChange({ ...caves, papin: { ...caves.papin, enabled: v } })}
          onDate={(d) => onChange({ ...caves, papin: { ...caves.papin, date: d } })}
        />
      </div>
    </div>
  );
}

export const emptyCaveTasks = (): CaveTaskState => ({
  rambuteau: { enabled: false, date: '' },
  papin: { enabled: false, date: '' },
});
