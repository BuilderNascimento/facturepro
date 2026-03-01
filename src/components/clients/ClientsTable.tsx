'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

interface Row {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  reference: string;
}

interface ClientsTableProps {
  rows: Row[];
}

export function ClientsTable({ rows }: ClientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 px-4 w-10">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label="Selecionar todos" />
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nome</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Referência</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Telefone</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="py-3 px-4">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label={`Sélectionner ${row.company_name}`} />
              </td>
              <td className="py-3 px-4">
                <Link href={`/clients/${row.id}/edit`} className="inline-flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-medium text-slate-800 hover:text-primary-600">{row.company_name}</span>
                    {row.contact_name && (
                      <span className="block text-xs text-slate-500">{row.contact_name}</span>
                    )}
                  </div>
                </Link>
              </td>
              <td className="py-3 px-4 text-slate-600 text-sm">{row.reference}</td>
              <td className="py-3 px-4 text-slate-600">{row.phone ?? '—'}</td>
              <td className="py-3 px-4 text-slate-600 text-sm">{row.email ?? '—'}</td>
              <td className="py-3 px-4">
                <Link
                  href={`/clients/${row.id}/edit`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
