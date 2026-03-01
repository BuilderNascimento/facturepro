import Link from 'next/link';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientsFilters } from '@/components/clients/ClientsFilters';
import { IS_DEMO } from '@/lib/demo/data';
import type { Client } from '@/lib/types/database';

async function getClients(): Promise<Client[]> {
  if (IS_DEMO) {
    const { storeGetClients } = await import('@/lib/demo/store');
    return storeGetClients();
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('clients').select('*').order('company_name');
  return (data ?? []) as Client[];
}

export default async function ClientsPage() {
  const clients = await getClients();
  const rows = clients.map((c, index) => ({
    id: c.id,
    company_name: c.company_name,
    contact_name: c.contact_name,
    email: c.email,
    phone: c.phone,
    reference: `C-${String(index + 1).padStart(6, '0')}`,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
      <ClientsFilters />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!rows.length ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum cliente. <Link href="/clients/new" className="text-primary-600 hover:underline">Adicionar cliente</Link>
          </div>
        ) : (
          <ClientsTable rows={rows} />
        )}
      </div>
    </div>
  );
}
