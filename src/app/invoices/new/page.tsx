import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IS_DEMO } from '@/lib/demo/data';

async function getData() {
  if (IS_DEMO) {
    const { storeGetClients, storeGetProperties } = await import('@/lib/demo/store');
    const clients = storeGetClients().map((c) => ({ id: c.id, company_name: c.company_name, email: c.email }));
    const properties = storeGetProperties().map((p) => ({
      id: p.id,
      client_id: p.client_id,
      name: p.name,
      normal_price: p.normal_price,
      extra_price: p.extra_price,
      clients: p.clients ? { company_name: p.clients.company_name } : null,
    }));
    return { clients, properties };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const [clientsRes, propertiesRes] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('properties').select('id, client_id, name, normal_price, extra_price, clients(company_name)').order('name'),
  ]);
  return {
    clients: clientsRes.data ?? [],
    properties: propertiesRes.data ?? [],
  };
}

export default async function NewInvoicePage() {
  const { clients, properties } = await getData();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nova fatura</h1>
      <InvoiceForm clients={clients as never} properties={properties as never} />
    </div>
  );
}
