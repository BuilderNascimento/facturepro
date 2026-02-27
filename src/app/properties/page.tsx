import Link from 'next/link';
import { Plus, Pencil, Building2, User } from 'lucide-react';
import { IS_DEMO } from '@/lib/demo/data';
import type { Property, Client } from '@/lib/types/database';

async function getProperties(): Promise<(Property & { clients: Client | null })[]> {
  if (IS_DEMO) {
    const { storeGetProperties } = await import('@/lib/demo/store');
    return storeGetProperties();
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('properties')
    .select('*, clients(id, company_name, contact_name)')
    .order('name');
  return (data ?? []) as (Property & { clients: Client | null })[];
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Appartements</h1>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvel appartement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!properties.length ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">Aucun appartement enregistré.</p>
            <Link href="/properties/new" className="text-primary-600 hover:underline text-sm">
              Ajouter un appartement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Appartement</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Propriétaire</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Adresse</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Limpeza normal</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Limpeza extra</th>
                  <th className="px-4 py-3 font-medium text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-600 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.clients ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-700">{p.clients.company_name}</p>
                            {p.clients.contact_name && (
                              <p className="text-xs text-slate-500">{p.clients.contact_name}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.address ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-slate-800">{Number(p.normal_price).toFixed(2)} €</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-emerald-700">{Number(p.extra_price).toFixed(2)} €</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/properties/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
