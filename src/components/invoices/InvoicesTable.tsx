'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText } from 'lucide-react';

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

const displayStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'En Attente',
  paid: 'Payée',
  overdue: 'En Retard',
  echeance: 'À Échéance',
};

function statusTagClass(displayStatus: string): string {
  switch (displayStatus) {
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'sent':
      return 'bg-violet-100 text-violet-800';
    case 'echeance':
      return 'bg-amber-100 text-amber-800';
    case 'draft':
      return 'bg-slate-100 text-slate-700';
    case 'paid':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function InvoicesTable({ rows, statusLabels }: InvoicesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 w-10">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label="Tout sélectionner" />
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Référence</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Client</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total HT</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total TTC</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Émission</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="py-3 px-4">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label={`Sélectionner ${row.reference}`} />
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
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusTagClass(row.displayStatus)}`}>
                  {displayStatusLabels[row.displayStatus] ?? statusLabels[row.status]}
                </span>
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
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
