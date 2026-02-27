import { notFound } from 'next/navigation';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { IS_DEMO } from '@/lib/demo/data';
import type { Property, Client } from '@/lib/types/database';

async function getData(id: string) {
  if (IS_DEMO) {
    const { storeGetProperty, storeGetClients } = await import('@/lib/demo/store');
    const property = storeGetProperty(id);
    if (!property) return null;
    const clients = storeGetClients().map((c) => ({ id: c.id, company_name: c.company_name, contact_name: c.contact_name }));
    return { property, clients };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const [{ data: property }, { data: clients }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, company_name, contact_name').order('company_name'),
  ]);
  if (!property) return null;
  return {
    property: property as Property,
    clients: (clients ?? []) as Pick<Client, 'id' | 'company_name' | 'contact_name'>[],
  };
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Modifier l'appartement</h1>
      <PropertyForm property={data.property} clients={data.clients} />
    </div>
  );
}
