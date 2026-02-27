'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { invoiceSchema, type InvoiceItemInput } from '@/lib/validations/schemas';
import { format, addDays } from 'date-fns';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';

interface Client { id: string; company_name: string; email: string; }
interface Service { id: string; name: string; unit_price: number; unit_type: string; }

interface InvoiceFormProps {
  invoice?: {
    id: string;
    invoice_number: string;
    client_id: string;
    issue_date: string;
    due_date: string;
    status: string;
    items: { service_id: string | null; description: string; quantity: number; unit_price: number; services?: Service | null }[];
  };
  clients?: Client[];
  services?: Service[];
  nextNumber?: string;
}

export function InvoiceForm({
  invoice,
  clients = [],
  services = [],
  nextNumber: initialNextNumber,
}: InvoiceFormProps) {
  const router = useRouter();
  const [nextNumber, setNextNumber] = useState(initialNextNumber ?? '');
  const [clientId, setClientId] = useState(invoice?.client_id ?? '');
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date ?? format(new Date(), 'yyyy-MM-dd')
  );
  const [dueDate, setDueDate] = useState(
    invoice?.due_date ?? format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [status, setStatus] = useState(invoice?.status ?? 'draft');
  const [items, setItems] = useState<InvoiceItemInput[]>(
    invoice?.items?.length
      ? invoice.items.map((i) => ({
          service_id: i.service_id ?? undefined,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        }))
      : [{ description: '', quantity: 1, unit_price: 0 }]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invoice && !initialNextNumber) {
      fetch('/api/invoices/next-number', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => d.invoice_number && setNextNumber(d.invoice_number))
        .catch(() => {});
    }
  }, [invoice, initialNextNumber]);

  function addLine() {
    setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0 }]);
  }

  function removeLine(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function updateItem(index: number, field: keyof InvoiceItemInput, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'service_id' && value) {
        const svc = services.find((s) => s.id === value);
        if (svc) {
          next[index].description = svc.name;
          next[index].unit_price = svc.unit_price;
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const filtered = items.filter((i) => i.description.trim());
    if (!filtered.length) {
      setError('Au moins une ligne avec une description.');
      setLoading(false);
      return;
    }
    const raw = {
      client_id: clientId,
      issue_date: issueDate,
      due_date: dueDate,
      status,
      items: filtered,
    };
    const parsed = invoiceSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Données invalides');
      setLoading(false);
      return;
    }
    const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
    const res = await fetch(url, {
      method: invoice ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Erreur serveur');
      return;
    }
    if (data.id) router.push(`/invoices/${data.id}`);
    else {
      router.push('/invoices');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {invoice && (
          <p className="text-slate-600">
            <span className="font-medium">N° facture :</span> {invoice.invoice_number}
          </p>
        )}
        {!invoice && nextNumber && (
          <p className="text-slate-600">
            <span className="font-medium">N° facture :</span> {nextNumber}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} – {c.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d’émission *</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d’échéance *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-800">Lignes de facturation</h2>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm">
            <Plus className="w-4 h-4" /> Ajouter une ligne
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs text-slate-500 mb-0.5">Service (optionnel)</label>
                <select
                  value={item.service_id ?? ''}
                  onChange={(e) => updateItem(index, 'service_id', e.target.value || undefined!)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                >
                  <option value="">—</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} – {Number(s.unit_price).toFixed(2)} €</option>
                  ))}
                </select>
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs text-slate-500 mb-0.5">Description *</label>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  required
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-4 md:col-span-1">
                <label className="block text-xs text-slate-500 mb-0.5">Qté</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs text-slate-500 mb-0.5">Prix unit. (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                />
              </div>
              <div className="col-span-4 md:col-span-1 flex items-end">
                <span className="text-sm font-medium py-1.5">
                  {(item.quantity * item.unit_price).toFixed(2)} €
                </span>
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end">
                <button type="button" onClick={() => removeLine(index)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Total HT : {items.reduce((s, i) => s + i.quantity * i.unit_price, 0).toFixed(2)} €
          {' '}(TVA non applicable)
        </p>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Enregistrement...' : invoice ? 'Mettre à jour' : 'Créer la facture'}
        </button>
        <Link href="/invoices" className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Annuler</Link>
      </div>
    </form>
  );
}
