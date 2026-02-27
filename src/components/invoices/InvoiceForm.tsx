'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Plus, Trash2, CalendarDays, Sparkles, Car, Clock, Package } from 'lucide-react';
import { invoiceSchema } from '@/lib/validations/schemas';

interface Client { id: string; company_name: string; email: string | null; }
interface Property { id: string; client_id: string; name: string; normal_price: number; extra_price: number; clients?: { company_name: string } | null; }

interface CleaningEntry { date: string; }
interface DisplacementEntry { description: string; amount: number; }
interface ExtraHourEntry { description: string; hours: number; rate: number; }
interface OtherItem { description: string; quantity: number; unit_price: number; }

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

export function InvoiceForm({ invoice, clients = [], properties = [], nextNumber: initialNextNumber }: InvoiceFormProps) {
  const router = useRouter();
  const [nextNumber, setNextNumber] = useState(initialNextNumber ?? '');
  const [mode, setMode] = useState<'property' | 'client'>('property');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [clientId, setClientId] = useState(invoice?.client_id ?? '');
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState(invoice?.status ?? 'draft');

  // Limpezas normais
  const [normalPrice, setNormalPrice] = useState(0);
  const [normalDates, setNormalDates] = useState<CleaningEntry[]>([]);

  // Limpezas extra
  const [extraPrice, setExtraPrice] = useState(0);
  const [extraDates, setExtraDates] = useState<CleaningEntry[]>([]);

  // Deslocamentos
  const [displacements, setDisplacements] = useState<DisplacementEntry[]>([]);

  // Horas suplementares
  const [extraHours, setExtraHours] = useState<ExtraHourEntry[]>([]);

  // Outros
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se estiver editando, carrega os itens existentes como "outros"
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

  function handlePropertyChange(propId: string) {
    setSelectedPropertyId(propId);
    const prop = properties.find((p) => p.id === propId);
    if (prop) {
      setClientId(prop.client_id);
      setNormalPrice(Number(prop.normal_price));
      setExtraPrice(Number(prop.extra_price));
    }
  }

  function addNormalDate() { setNormalDates((p) => [...p, { date: '' }]); }
  function removeNormalDate(i: number) { setNormalDates((p) => p.filter((_, idx) => idx !== i)); }
  function updateNormalDate(i: number, date: string) {
    setNormalDates((p) => { const n = [...p]; n[i] = { date }; return n; });
  }

  function addExtraDate() { setExtraDates((p) => [...p, { date: '' }]); }
  function removeExtraDate(i: number) { setExtraDates((p) => p.filter((_, idx) => idx !== i)); }
  function updateExtraDate(i: number, date: string) {
    setExtraDates((p) => { const n = [...p]; n[i] = { date }; return n; });
  }

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

  function buildItems() {
    const items: { service_id: null; description: string; quantity: number; unit_price: number }[] = [];

    const validNormal = normalDates.filter((d) => d.date);
    if (validNormal.length > 0) {
      const dateList = validNormal.map((d) => formatDateLabel(d.date)).join(', ');
      items.push({
        service_id: null,
        description: `Limpeza normal — ${dateList}`,
        quantity: validNormal.length,
        unit_price: normalPrice,
      });
    }

    const validExtra = extraDates.filter((d) => d.date);
    if (validExtra.length > 0) {
      const dateList = validExtra.map((d) => formatDateLabel(d.date)).join(', ');
      items.push({
        service_id: null,
        description: `Limpeza extra — ${dateList}`,
        quantity: validExtra.length,
        unit_price: extraPrice,
      });
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

  const totalHt = (() => {
    let t = 0;
    const vn = normalDates.filter((d) => d.date);
    if (vn.length) t += vn.length * normalPrice;
    const ve = extraDates.filter((d) => d.date);
    if (ve.length) t += ve.length * extraPrice;
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
      setError('Adicione pelo menos uma linha (limpeza, deslocamento ou outra).');
      return;
    }

    const usedClientId = mode === 'property'
      ? (properties.find((p) => p.id === selectedPropertyId)?.client_id ?? clientId)
      : clientId;

    if (!usedClientId) {
      setError('Selecione um cliente ou um apartamento.');
      return;
    }

    const raw = { client_id: usedClientId, issue_date: issueDate, due_date: dueDate, status, items };
    const parsed = invoiceSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
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

    if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return; }
    if (data.id) router.push(`/invoices/${data.id}`);
    else { router.push('/invoices'); router.refresh(); }
  }

  const selectedProp = properties.find((p) => p.id === selectedPropertyId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      {/* ── Cabeçalho ── */}
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
              Par appartement
            </button>
            <button
              type="button"
              onClick={() => setMode('client')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'client' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Par client direct
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção de apartamento ou cliente */}
          {!invoice && mode === 'property' ? (
            <div className="md:col-span-2">
              <label className={LABEL}>Appartement *</label>
              {properties.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                  Nenhum apartamento.{' '}
                  <Link href="/properties/new" className="underline font-medium">Criar primeiro</Link>.
                </p>
              ) : (
                <select
                  value={selectedPropertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  required
                  className={INPUT}
                >
                  <option value="">Selecionar o apartamento</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.clients?.company_name ? ` — ${p.clients.company_name}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {selectedProp && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                  <span>Proprietário: <strong>{selectedProp.clients?.company_name ?? '—'}</strong></span>
                  <span>Normal: <strong>{Number(selectedProp.normal_price).toFixed(2)} €</strong></span>
                  <span>Extra: <strong>{Number(selectedProp.extra_price).toFixed(2)} €</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className={invoice ? '' : 'md:col-span-2'}>
              <label className={LABEL}>Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required={mode === 'client' || !!invoice}
                className={INPUT}
              >
                <option value="">Selecionar um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL}>Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Date d'émission *</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Date d'échéance *</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={INPUT} />
          </div>
        </div>
      </div>

      {/* ── Limpezas normais ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<CalendarDays className="w-4 h-4 text-blue-700" />}
          title="Limpezas normais"
          color="bg-blue-50 border-b border-blue-100"
        />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className={LABEL}>Preço por limpeza (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={normalPrice}
                onChange={(e) => setNormalPrice(parseFloat(e.target.value) || 0)}
                className={INPUT}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL}>Subtotal</label>
              <p className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 border border-slate-200">
                {normalDates.filter((d) => d.date).length} × {normalPrice.toFixed(2)} € = <strong>{(normalDates.filter((d) => d.date).length * normalPrice).toFixed(2)} €</strong>
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {normalDates.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateNormalDate(i, e.target.value)}
                  className={`${INPUT} flex-1`}
                />
                {entry.date && (
                  <span className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded">
                    {formatDateLabel(entry.date)}
                  </span>
                )}
                <button type="button" onClick={() => removeNormalDate(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addNormalDate} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar data de limpeza
          </button>
        </div>
      </div>

      {/* ── Limpezas extra ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Sparkles className="w-4 h-4 text-emerald-700" />}
          title="Limpezas extra"
          color="bg-emerald-50 border-b border-emerald-100"
        />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className={LABEL}>Preço por limpeza extra (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={extraPrice}
                onChange={(e) => setExtraPrice(parseFloat(e.target.value) || 0)}
                className={INPUT}
              />
            </div>
            <div className="flex-1">
              <label className={LABEL}>Subtotal</label>
              <p className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 border border-slate-200">
                {extraDates.filter((d) => d.date).length} × {extraPrice.toFixed(2)} € = <strong>{(extraDates.filter((d) => d.date).length * extraPrice).toFixed(2)} €</strong>
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {extraDates.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateExtraDate(i, e.target.value)}
                  className={`${INPUT} flex-1`}
                />
                {entry.date && (
                  <span className="text-xs text-slate-500 bg-emerald-50 px-2 py-1 rounded">
                    {formatDateLabel(entry.date)}
                  </span>
                )}
                <button type="button" onClick={() => removeExtraDate(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addExtraDate} className="text-emerald-600 hover:underline text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar data extra
          </button>
        </div>
      </div>

      {/* ── Deslocamentos ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Car className="w-4 h-4 text-amber-700" />}
          title="Déplacements"
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
                  placeholder="Ex: Déplacement 25 km A/R"
                  className={`${INPUT}`}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs text-slate-500 mb-0.5">Montant (€)</label>
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
            <Plus className="w-4 h-4" /> Ajouter un déplacement
          </button>
        </div>
      </div>

      {/* ── Horas suplementares ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Clock className="w-4 h-4 text-violet-700" />}
          title="Heures supplémentaires"
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
                  placeholder="Ex: Nettoyage hotte, four…"
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Heures (h)</label>
                <input
                  type="number" step="0.25" min="0.25"
                  value={h.hours}
                  onChange={(e) => updateExtraHour(i, 'hours', parseFloat(e.target.value) || 0)}
                  className={INPUT}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-slate-500 mb-0.5">Tarif /h (€)</label>
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
            <Plus className="w-4 h-4" /> Ajouter des heures supp.
          </button>
        </div>
      </div>

      {/* ── Outros itens ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<Package className="w-4 h-4 text-slate-600" />}
          title="Autres lignes"
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
                  placeholder="Description de la ligne"
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
            <Plus className="w-4 h-4" /> Ajouter une ligne libre
          </button>
        </div>
      </div>

      {/* ── Total ── */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-slate-700">Total HT</span>
        <span className="text-2xl font-bold text-primary-700">{totalHt.toFixed(2)} €</span>
        <span className="text-sm text-slate-500 ml-2">(TVA non applicable)</span>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm"
        >
          {loading ? 'Enregistrement...' : invoice ? 'Mettre à jour' : 'Créer la facture'}
        </button>
        <Link href="/invoices" className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm">
          Annuler
        </Link>
      </div>
    </form>
  );
}
