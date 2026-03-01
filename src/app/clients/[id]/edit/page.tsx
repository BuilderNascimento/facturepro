import { notFound } from 'next/navigation';
import { ClientForm } from '@/components/clients/ClientForm';
import { IS_DEMO } from '@/lib/demo/data';
import type { Client } from '@/lib/types/database';

async function getClient(id: string): Promise<Client | null> {
  if (IS_DEMO) {
    const { storeGetClient } = await import('@/lib/demo/store');
    return storeGetClient(id);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('clients').select('*').eq('id', id).single();
  return (data as Client | null) ?? null;
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Editar cliente</h1>
      <ClientForm client={client} />
    </div>
  );
}
