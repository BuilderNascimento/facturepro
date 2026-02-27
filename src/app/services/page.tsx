import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { IS_DEMO } from '@/lib/demo/data';
import type { Service } from '@/lib/types/database';

const unitLabels: Record<string, string> = {
  hora: 'Heure',
  'serviço': 'Service',
  pacote: 'Forfait',
  mensal: 'Mensuel',
};

async function getServices(): Promise<Service[]> {
  if (IS_DEMO) {
    const { storeGetServices } = await import('@/lib/demo/store');
    return storeGetServices();
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('services').select('*').order('name');
  return (data ?? []) as Service[];
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Articles</h1>
        <Link
          href="/services/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition"
        >
          <Plus className="w-4 h-4" />
          Nouveau article
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!services.length ? (
          <div className="p-12 text-center text-slate-500">
            Aucun article. <Link href="/services/new" className="text-primary-600 hover:underline">Ajouter</Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {services.map((s) => (
              <li key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">{s.name}</p>
                  {s.description && <p className="text-sm text-slate-600">{s.description}</p>}
                  <p className="text-sm text-slate-500 mt-1">
                    {Number(s.unit_price).toFixed(2)} € / {unitLabels[s.unit_type] ?? s.unit_type}
                  </p>
                </div>
                <Link
                  href={`/services/${s.id}/edit`}
                  className="mt-2 sm:mt-0 inline-flex items-center gap-1 text-primary-600 hover:underline text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
