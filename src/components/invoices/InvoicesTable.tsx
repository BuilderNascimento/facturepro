'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Row {
  id: string;
  invoice_number: string;
  reference: string;
  client: string;
  issue_date: string;
  due_date: string;
  status: string;
  displayStatus: string;
  total_ht: number;
  total_ttc: number;
}

interface InvoicesTableProps {
  rows: Row[];
  statusLabels: Record<string, string>;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho', cls: 'bg-slate-100 text-slate-700' },
  { value: 'sent', label: 'Enviada', cls: 'bg-violet-100 text-violet-800' },
  { value: 'paid', label: 'Paga', cls: 'bg-emerald-100 text-emerald-800' },
  { value: 'overdue', label: 'Em Atraso', cls: 'bg-red-100 text-red-800' },
];

const displayStatusLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Em Espera',
  paid: 'Paga',
  overdue: 'Em Atraso',
  echeance: 'A Vencer',
};

function StatusDropdown({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const current = STATUS_OPTIONS.find((o) => o.value === currentStatus) ?? STATUS_OPTIONS[0];

  async function changeStatus(newStatus: string) {
    if (newStatus === currentStatus) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    await fetch(`/api/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((p) => !p)}
        className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition ${current.cls} ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? '…' : (displayStatusLabels[currentStatus] ?? current.label)} ▾
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => changeStatus(opt.value)}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center gap-2 ${opt.value === currentStatus ? 'opacity-40 cursor-default' : ''}`}
              >
                <span className={`inline-block px-2 py-0.5 rounded-full ${opt.cls}`}>{opt.label}</span>
                {opt.value === currentStatus && <span className="text-slate-400">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function InvoicesTable({ rows, statusLabels }: InvoicesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 w-10">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label="Selecionar todos" />
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Referência</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Cliente</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Estado</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total HT</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total TTC</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Emissão</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="py-3 px-4">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label={`Selecionar ${row.reference}`} />
              </td>
              <td className="py-3 px-4">
                <Link href={`/invoices/${row.id}`} className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 text-xs font-medium">
                    F
                  </span>
                  <span className="font-medium text-primary-600 hover:underline">{row.reference}</span>
                </Link>
              </td>
              <td className="py-3 px-4 text-slate-700">{row.client}</td>
              <td className="py-3 px-4">
                <StatusDropdown invoiceId={row.id} currentStatus={row.status} />
              </td>
              <td className="py-3 px-4 text-right text-slate-700">{row.total_ht.toFixed(2)} €</td>
              <td className="py-3 px-4 text-right font-medium text-slate-800">{row.total_ttc.toFixed(2)} €</td>
              <td className="py-3 px-4 text-slate-600 text-sm">
                {format(new Date(row.issue_date), 'd MMM yyyy', { locale: fr })}
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/invoices/${row.id}`}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
