'use client';

import { Plus, Trash2, Users } from 'lucide-react';
import {
  type ExtraPersonnelEntryInput,
  formatHoursFr,
  sumAssignmentHours,
} from '@/lib/extra-personnel';
import { formatPropertyOptionLabel, getVeryStayPropertyVisual } from '@/lib/verystay-property-visuals';

interface PropertyOption {
  id: string;
  name: string;
}

interface ExtraPersonnelSectionProps {
  properties: PropertyOption[];
  entries: ExtraPersonnelEntryInput[];
  isVeryStay: boolean;
  onAddEntry: () => void;
  onRemoveEntry: (key: string) => void;
  onUpdateAmount: (key: string, amountTtc: number) => void;
  onAddAssignment: (entryKey: string) => void;
  onRemoveAssignment: (entryKey: string, assignmentIndex: number) => void;
  onUpdateAssignment: (
    entryKey: string,
    assignmentIndex: number,
    field: 'propertyId' | 'hours',
    value: string | number
  ) => void;
}

const INPUT =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';

export function ExtraPersonnelSection({
  properties,
  entries,
  isVeryStay,
  onAddEntry,
  onRemoveEntry,
  onUpdateAmount,
  onAddAssignment,
  onRemoveAssignment,
  onUpdateAssignment,
}: ExtraPersonnelSectionProps) {
  const totalHours = entries.reduce(
    (s, e) => s + sumAssignmentHours(e.assignments),
    0
  );
  const totalTtc = entries.reduce((s, e) => s + (Number(e.amountTtc) || 0), 0);
  const count = entries.filter(
    (e) => e.assignments.some((a) => a.propertyId && a.hours > 0) || e.amountTtc > 0
  ).length;

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border-b border-indigo-100">
        <Users className="w-4 h-4 text-indigo-700" />
        <h3 className="font-semibold text-sm text-indigo-900">Extras personnels</h3>
        <span className="text-xs text-indigo-600 ml-1 hidden sm:inline">
          — intervenant supplémentaire sur un ou plusieurs appartements
        </span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-slate-600">
          Ajoutez une ligne par <strong>extra personnel</strong> (Extra 1, Extra 2…). Pour chaque
          ligne, indiquez les appartements, les heures sur chacun et le montant TTC de cet extra.
        </p>

        {entries.length === 0 && (
          <p className="text-xs text-slate-400 italic">Aucun extra personnel pour cette facture.</p>
        )}

        {entries.map((entry, entryIndex) => {
          const entryHours = sumAssignmentHours(entry.assignments);
          return (
            <div
              key={entry.key}
              className="rounded-xl border border-indigo-100 bg-indigo-50/30 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-indigo-100/50 border-b border-indigo-100">
                <span className="text-sm font-semibold text-indigo-900">
                  Extra {entryIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveEntry(entry.key)}
                  className="p-1 text-red-400 hover:bg-red-50 rounded"
                  aria-label="Supprimer cet extra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {entry.assignments.map((a, ai) => {
                  const visual = isVeryStay && a.propertyName
                    ? getVeryStayPropertyVisual(a.propertyName)
                    : null;
                  return (
                    <div
                      key={ai}
                      className="grid grid-cols-12 gap-2 items-end bg-white rounded-lg border border-slate-100 p-2"
                    >
                      <div className="col-span-6">
                        <label className="block text-xs text-slate-500 mb-0.5">Appartement</label>
                        <div className="flex items-center gap-1">
                          {visual && (
                            <span className="text-base shrink-0" aria-hidden>
                              {visual.emoji}
                            </span>
                          )}
                          <select
                            value={a.propertyId}
                            onChange={(e) =>
                              onUpdateAssignment(entry.key, ai, 'propertyId', e.target.value)
                            }
                            className={INPUT}
                          >
                            <option value="">Sélectionner</option>
                            {properties.map((p) => (
                              <option key={p.id} value={p.id}>
                                {isVeryStay ? formatPropertyOptionLabel(p.name) : p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-xs text-slate-500 mb-0.5">Heures</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={a.hours || ''}
                          onChange={(e) =>
                            onUpdateAssignment(
                              entry.key,
                              ai,
                              'hours',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="ex: 1.5 = 1 h 30"
                          className={INPUT}
                        />
                        {a.hours > 0 && (
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            {formatHoursFr(a.hours)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onRemoveAssignment(entry.key, ai)}
                          disabled={entry.assignments.length === 1}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => onAddAssignment(entry.key)}
                  className="text-indigo-600 hover:underline text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un appartement à cet extra
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-0.5">
                      Montant TTC (cet extra)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.amountTtc || ''}
                      onChange={(e) =>
                        onUpdateAmount(entry.key, parseFloat(e.target.value) || 0)
                      }
                      className={INPUT}
                      placeholder="ex: 50, 70, 100"
                    />
                  </div>
                  <div className="text-xs text-slate-600 flex flex-col justify-end pb-2">
                    <span>
                      Heures cet extra : <strong>{formatHoursFr(entryHours)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddEntry}
          disabled={properties.length === 0}
          className="text-indigo-700 hover:underline text-sm flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
        >
          <Plus className="w-4 h-4" /> Ajouter un extra personnel
        </button>

        {properties.length === 0 && (
          <p className="text-xs text-amber-600">
            Enregistrez des locaux pour ce client afin de choisir les appartements.
          </p>
        )}

        {count > 0 && (
          <div className="rounded-lg bg-indigo-900/5 border border-indigo-200 px-4 py-3 text-sm text-indigo-950 space-y-1">
            <p>
              <span className="text-indigo-700">→</span> Total heures extras :{' '}
              <strong>{formatHoursFr(totalHours)}</strong>
            </p>
            <p>
              <span className="text-indigo-700">→</span> Nombre d&apos;extras personnels :{' '}
              <strong>{count}</strong>
            </p>
            <p>
              <span className="text-indigo-700">→</span> Total extras :{' '}
              <strong>{totalTtc.toFixed(2)} € TTC</strong>
              {count > 0 && (
                <span className="text-indigo-700 text-xs ml-1">
                  ({(totalTtc / count).toFixed(2)} € / extra en moyenne)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
