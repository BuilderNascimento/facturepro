import { PropertyForm } from '@/components/properties/PropertyForm';
import { IS_DEMO } from '@/lib/demo/data';
import type { Client } from '@/lib/types/database';

async function getClients(): Promise<Pick<Client, 'id' | 'company_name' | 'contact_name'>[]> {
  if (IS_DEMO) {
    const { storeGetClients } = await import('@/lib/demo/store');
    return storeGetClients().map((c) => ({ id: c.id, company_name: c.company_name, contact_name: c.contact_name }));
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('clients').select('id, company_name, contact_name').order('company_name');
  return (data ?? []) as Pick<Client, 'id' | 'company_name' | 'contact_name'>[];
}

export default async function NewPropertyPage() {
  const clients = await getClients();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nouvel appartement</h1>
      <PropertyForm clients={clients} />
    </div>
  );
}
