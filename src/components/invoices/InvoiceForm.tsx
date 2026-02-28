'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Plus, Trash2, CalendarDays, Sparkles, Car, Clock, Package, Building2, X } from 'lucide-react';
import { invoiceSchema } from '@/lib/validations/schemas';

interface Client { id: string; company_name: string; email: string | null; }
interface Property {
  id: string;
  client_id: string;
  name: string;
  normal_price: number;
  extra_price: number;
  clients?: { company_name: string } | null;
}

interface CleaningEntry { date: string; }
interface DisplacementEntry { description: string; amount: number; }
interface ExtraHourEntry { description: string; hours: number; rate: number; }
interface OtherItem { description: string; quantity: number; unit_price: number; }

interface ApartmentBlock {
  key: string;
  propertyId: string;
  normalDates: CleaningEntry[];
  extraDates: CleaningEntry[];
}

interface InvoiceFormProps {
  invoice?: {
    id: string;
    invoice_number: string;
    client_id: string;
    issue_date: string;
    due_date: string;
    status: string;
    items: { service_id: string | null; description: string; quantity: number; unit_price: number }[];
  };
  clients?: Client[];
  properties?: Property[];
  nextNumber?: string;
}

const INPUT = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';
const LABEL = 'block text-sm font-medium text-slate-700 mb-1';

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-t-lg ${color}`}>
      {icon}
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
  );
}

function formatDateLabel(d: string) {
  if (!d) return '';
  try { return format(new Date(d + 'T12:00:00'), 'dd MMM', { locale: fr }); } catch { return d; }
}

let blockCounter = 0;
function newKey() { return `block-${++blockCounter}`; }

export function InvoiceForm({ invoice, clients = [], properties = [], nextNumber: initialNextNumber }: InvoiceFormProps) {
  const router = useRouter();
  const [nextNumber, setNextNumber] = useState(initialNextNumber ?? '');
  const [mode, setMode] = useState<'property' | 'client'>('property');

  // "Par appartements" mode
  const [clientId, setClientId] = useState(invoice?.client_id ?? '');
  const [apartmentBlocks, setApartmentBlocks] = useState<ApartmentBlock[]>([
    { key: newKey(), propertyId: '', normalDates: [], extraDates: [] },
  ]);

  // "Par client direct" mode
  const [directClientId, setDirectClientId] = useState(invoice?.client_id ?? '');

  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState(invoice?.status ?? 'draft');

  // Déplacements
  const [displacements, setDisplacements] = useState<DisplacementEntry[]>([]);
  // Heures supplémentaires
  const [extraHours, setExtraHours] = useState<ExtraHourEntry[]>([]);
  // Autres lignes
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice?.items?.length) {
      setOtherItems(
        invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))
      );
    }
  }, [invoice]);

  useEffect(() => {
    if (!invoice && !initialNextNumber) {
      fetch('/api/invoices/next-number', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => d.invoice_number && setNextNumber(d.invoice_number))
        .catch(() => {});
    }
  }, [invoice, initialNextNumber]);

  // Apartments filtered by selected client
  const clientApartments = properties.filter((p) => p.client_id === clientId);

  // ── Apartment blocks helpers ──
  function addApartmentBlock() {
    setApartmentBlocks((prev) => [...prev, { key: newKey(), propertyId: '', normalDates: [], extraDates: [] }]);
  }

  function removeApartmentBlock(key: string) {
    setApartmentBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function updateBlockProperty(key: string, propertyId: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) => b.key === key ? { ...b, propertyId } : b)
    );
  }

  function addNormalDate(key: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) => b.key === key ? { ...b, normalDates: [...b.normalDates, { date: '' }] } : b)
    );
  }

  function removeNormalDate(key: string, i: number) {
    setApartmentBlocks((prev) =>
      prev.map((b) => b.key === key ? { ...b, normalDates: b.normalDates.filter((_, idx) => idx !== i) } : b)
    );
  }

  function updateNormalDate(key: string, i: number, date: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== key) return b;
        const nd = [...b.normalDates]; nd[i] = { date }; return { ...b, normalDates: nd };
      })
    );
  }

  function addExtraDate(key: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) => b.key === key ? { ...b, extraDates: [...b.extraDates, { date: '' }] } : b)
    );
  }

  function removeExtraDate(key: string, i: number) {
    setApartmentBlocks((prev) =>
      prev.map((b) => b.key === key ? { ...b, extraDates: b.extraDates.filter((_, idx) => idx !== i) } : b)
    );
  }

  function updateExtraDate(key: string, i: number, date: string) {
    setApartmentBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== key) return b;
        const ed = [...b.extraDates]; ed[i] = { date }; return { ...b, extraDates: ed };
      })
    );
  }

  // ── Global section helpers ──
  function addDisplacement() { setDisplacements((p) => [...p, { description: '', amount: 0 }]); }
  function removeDisplacement(i: number) { setDisplacements((p) => p.filter((_, idx) => idx !== i)); }
  function updateDisplacement(i: number, field: keyof DisplacementEntry, value: string | number) {
    setDisplacements((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addExtraHour() { setExtraHours((p) => [...p, { description: '', hours: 1, rate: 0 }]); }
  function removeExtraHour(i: number) { setExtraHours((p) => p.filter((_, idx) => idx !== i)); }
  function updateExtraHour(i: number, field: keyof ExtraHourEntry, value: string | number) {
    setExtraHours((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  function addOtherItem() { setOtherItems((p) => [...p, { description: '', quantity: 1, unit_price: 0 }]); }
  function removeOtherItem(i: number) { setOtherItems((p) => p.filter((_, idx) => idx !== i)); }
  function updateOtherItem(i: number, field: keyof OtherItem, value: string | number) {
    setOtherItems((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
  }

  // ── Build invoice items from all apartment blocks ──
  function buildItems() {
    const items: { service_id: null; description: string; quantity: number; unit_price: number }[] = [];

    if (mode === 'property') {
      for (const block of apartmentBlocks) {
        const prop = properties.find((p) => p.id === block.propertyId);
        const aptName = prop?.name ?? '';
        const normalPrice = Number(prop?.normal_price ?? 0);
        const extraPrice = Number(prop?.extra_price ?? 0);

        const validNormal = block.normalDates.filter((d) => d.date);
        if (validNormal.length > 0) {
          const dateList = validNormal.map((d) => formatDateLabel(d.date)).join(', ');
          items.push({
            service_id: null,
            description: aptName
              ? `Nettoyage normal — ${aptName} — ${dateList}`
              : `Nettoyage normal — ${dateList}`,
            quantity: validNormal.length,
            unit_price: normalPrice,
          });
        }

        const validExtra = block.extraDates.filter((d) => d.date);
        if (validExtra.length > 0) {
          const dateList = validExtra.map((d) => formatDateLabel(d.date)).join(', ');
          items.push({
            service_id: null,
            description: aptName
              ? `Nettoyage extra — ${aptName} — ${dateList}`
              : `Nettoyage extra — ${dateList}`,
            quantity: validExtra.length,
            unit_price: extraPrice,
          });
        }
      }
    }

    displacements.forEach((d) => {
      if (d.description || d.amount > 0) {
        items.push({
          service_id: null,
          description: `Déplacement${d.description ? ' — ' + d.description : ''}`,
          quantity: 1,
          unit_price: d.amount,
        });
      }
    });

    extraHours.forEach((h) => {
      if (h.hours > 0 || h.description) {
        items.push({
          service_id: null,
          description: `Heures supplémentaires${h.description ? ' — ' + h.description : ''}`,
          quantity: h.hours || 1,
          unit_price: h.rate,
        });
      }
    });

    otherItems.forEach((o) => {
      if (o.description.trim()) {
        items.push({ service_id: null, description: o.description, quantity: o.quantity, unit_price: o.unit_price });
      }
    });

    return items;
  }

  // ── Running total ──
  const totalHt = (() => {
    let t = 0;
    if (mode === 'property') {
      for (const block of apartmentBlocks) {
        const prop = properties.find((p) => p.id === block.propertyId);
        const normalPrice = Number(prop?.normal_price ?? 0);
        const extraPrice = Number(prop?.extra_price ?? 0);
        t += block.normalDates.filter((d) => d.date).length * normalPrice;
        t += block.extraDates.filter((d) => d.date).length * extraPrice;
      }
    }
    displacements.forEach((d) => { t += d.amount; });
    extraHours.forEach((h) => { t += h.hours * h.rate; });
    otherItems.forEach((o) => { t += o.quantity * o.unit_price; });
    return t;
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const items = buildItems();
    if (!items.length) {
      setError('Adicione pelo menos um item (limpeza, deslocamento ou outro).');
      return;
    }

    const usedClientId = mode === 'property' ? clientId : directClientId;
    if (!usedClientId) {
      setError('Selecione um cliente.');
      return;
    }

    if (mode === 'property' && apartmentBlocks.some((b) => !b.propertyId)) {
      setError('Selecione um local para cada bloco, ou remova os blocos vazios.');
      return;
    }

    const raw = { client_id: usedClientId, issue_date: issueDate, due_date: dueDate, status, items };
    const parsed = invoiceSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Données invalides');
      return;
    }

    setLoading(true);
    const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
    const res = await fetch(url, {
      method: invoice ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Erro no servidor'); return; }
    if (data.id) router.push(`/invoices/${data.id}`);
    else { router.push('/invoices'); router.refresh(); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      {/* ── En-tête ── */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {invoice && (
          <p className="text-slate-600 text-sm">
            <span className="font-medium">N° facture :</span>{' '}
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{invoice.invoice_number}</span>
          </p>
        )}
        {!invoice && nextNumber && (
          <p className="text-slate-600 text-sm">
            <span className="font-medium">N° facture :</span>{' '}
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{nextNumber}</span>
          </p>
        )}

        {/* Mode selector */}
        {!invoice && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('property')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'property' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Por local de trabalho
            </button>
            <button
              type="button"
              onClick={() => setMode('client')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'client' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Por cliente direto
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção cliente */}
          {mode === 'property' ? (
            <div className="md:col-span-2">
              <label className={LABEL}>Cliente / Proprietário *</label>
              <select
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setApartmentBlocks([{ key: newKey(), propertyId: '', normalDates: [], extraDates: [] }]); }}
                required={mode === 'property'}
                className={INPUT}
              >
                <option value="">Selecionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={invoice ? '' : 'md:col-span-2'}>
              <label className={LABEL}>Cliente *</label>
              <select
                value={directClientId}
                onChange={(e) => setDirectClientId(e.target.value)}
                required={mode === 'client' || !!invoice}
                className={INPUT}
              >
                <option value="">Selecionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="paid">Paga</option>
              <option value="overdue">Em atraso</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Data de emissão *</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Data de vencimento *</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={INPUT} />
          </div>
        </div>
      </div>

      {/* ── Blocs d'appartements ── */}
      {mode === 'property' && (
        <>
          {apartmentBlocks.map((block, blockIndex) => {
            const prop = properties.find((p) => p.id === block.propertyId);
            const normalPrice = Number(prop?.normal_price ?? 0);
            const extraPrice = Number(prop?.extra_price ?? 0);
            const validNormal = block.normalDates.filter((d) => d.date);
            const validExtra = block.extraDates.filter((d) => d.date);

            return (
              <div key={block.key} className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
                {/* Bloc header */}
                <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-700" />
                    <span className="font-semibold text-sm text-primary-800">
                      Local {blockIndex + 1}
                      {prop ? ` — ${prop.name}` : ''}
                    </span>
                  </div>
                  {apartmentBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeApartmentBlock(block.key)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded transition"
                      title="Supprimer ce bloc"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Sélection appartement */}
                  <div>
                    <label className={LABEL}>Local de trabalho *</label>
                    {!clientId ? (
                      <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                        Selecione primeiro o cliente acima.
                      </p>
                    ) : clientApartments.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                        Nenhum local cadastrado para este cliente.{' '}
                        <Link href="/properties/new" className="underline font-medium">Criar local</Link>.
                      </p>
                    ) : (
                      <select
                        value={block.propertyId}
                        onChange={(e) => updateBlockProperty(block.key, e.target.value)}
                        className={INPUT}
                      >
                        <option value="">Selecionar local</option>
                        {clientApartments.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}

                    {prop && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                        <span>Valor normal : <strong>{normalPrice.toFixed(2)} €</strong></span>
                        <span>Valor extra : <strong>{extraPrice.toFixed(2)} €</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Nettoyages normaux */}
                  <div className="rounded-lg border border-blue-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-700" />
                      <span className="text-xs font-semibold text-blue-800">Limpezas normais</span>
                      {validNormal.length > 0 && prop && (
                        <span className="ml-auto text-xs text-blue-700 font-medium">
                          {validNormal.length} × {normalPrice.toFixed(2)} € = <strong>{(validNormal.length * normalPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {block.normalDates.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateNormalDate(block.key, i, e.target.value)}
                            className={`${INPUT} flex-1`}
                          />
                          {entry.date && (
                            <span className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                              {formatDateLabel(entry.date)}
                            </span>
                          )}
                          <button type="button" onClick={() => removeNormalDate(block.key, i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addNormalDate(block.key)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Adicionar data de limpeza
                      </button>
                    </div>
                  </div>

                  {/* Nettoyages extra */}
                  <div className="rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-b border-emerald-100">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-xs font-semibold text-emerald-800">Limpezas extra</span>
                      {validExtra.length > 0 && prop && (
                        <span className="ml-auto text-xs text-emerald-700 font-medium">
                          {validExtra.length} × {extraPrice.toFixed(2)} € = <strong>{(validExtra.length * extraPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {block.extraDates.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateExtraDate(block.key, i, e.target.value)}
                            className={`${INPUT} flex-1`}
                          />
                          {entry.date && (
                            <span className="text-xs text-slate-500 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">
                              {formatDateLabel(entry.date)}
                            </span>
                          )}
                          <button type="button" onClick={() => removeExtraDate(block.key, i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addExtraDate(block.key)} className="text-emerald-600 hover:underline text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Adicionar data (extra)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bouton ajouter appartement */}
          {clientId && (
            <button
              type="button"
              onClick={addApartmentBlock}
              className="w-full py-3 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 hover:border-primary-500 hover:bg-primary-50 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar outro local
            </button>
          )}
        </>
      )}

      {/* ── Déplacements ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Car className="w-4 h-4 text-amber-700" />}
          title="Deslocamentos"
          color="bg-amber-50 border-b border-amber-100"
        />
        <div className="p-4 space-y-3">
          {displacements.map((d, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-7">
                <label className="block text-xs text-slate-500 mb-0.5">Description</label>
                <input
                  value={d.description}
                  onChange={(e) => updateDisplacement(i, 'description', e.target.value)}
                  placeholder="Ex: Deslocamento 25 km ida/volta"
                  className={INPUT}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs text-slate-500 mb-0.5">Valor (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={d.amount}
                  onChange={(e) => updateDisplacement(i, 'amount', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeDisplacement(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addDisplacement} className="text-amber-700 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar deslocamento
          </button>
        </div>
      </div>

      {/* ── Heures supplémentaires ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Clock className="w-4 h-4 text-violet-700" />}
          title="Horas extras"
          color="bg-violet-50 border-b border-violet-100"
        />
        <div className="p-4 space-y-3">
          {extraHours.map((h, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <label className="block text-xs text-slate-500 mb-0.5">Description</label>
                <input
                  value={h.description}
                  onChange={(e) => updateExtraHour(i, 'description', e.target.value)}
                  placeholder="Ex: Limpeza de coifa, forno…"
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Horas (h)</label>
                <input
                  type="number" step="0.25" min="0.25"
                  value={h.hours}
                  onChange={(e) => updateExtraHour(i, 'hours', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Tarifa /h (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={h.rate}
                  onChange={(e) => updateExtraHour(i, 'rate', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeExtraHour(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addExtraHour} className="text-violet-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar horas extras
          </button>
        </div>
      </div>

      {/* ── Autres lignes ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Package className="w-4 h-4 text-slate-600" />}
          title="Outros itens"
          color="bg-slate-50 border-b border-slate-200"
        />
        <div className="p-4 space-y-3">
          {otherItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <label className="block text-xs text-slate-500 mb-0.5">Description *</label>
                <input
                  value={item.description}
                  onChange={(e) => updateOtherItem(i, 'description', e.target.value)}
                  placeholder="Descrição do item"
                  className={INPUT}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-0.5">Qté</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={item.quantity}
                  onChange={(e) => updateOtherItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Prix unit. (€)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={item.unit_price}
                  onChange={(e) => updateOtherItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeOtherItem(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addOtherItem} className="text-slate-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar item livre
          </button>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-slate-700">Total HT</span>
        <span className="text-2xl font-bold text-primary-700">{totalHt.toFixed(2)} €</span>
        <span className="text-sm text-slate-500 ml-2">(TVA não aplicável)</span>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
        >
          {loading ? 'Salvando...' : invoice ? 'Atualizar' : 'Criar fatura'}
        </button>
        <Link href="/invoices" className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
