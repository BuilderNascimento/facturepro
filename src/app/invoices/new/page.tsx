import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IS_DEMO, demoClients, demoServices } from '@/lib/demo/data';

async function getData() {
  if (IS_DEMO) {
    return {
      clients: demoClients.map((c) => ({ id: c.id, company_name: c.company_name, email: c.email })),
      services: demoServices.map((s) => ({ id: s.id, name: s.name, unit_price: s.unit_price, unit_type: s.unit_type })),
    };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const [clientsRes, servicesRes] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('services').select('id, name, unit_price, unit_type').order('name'),
  ]);
  return { clients: clientsRes.data ?? [], services: servicesRes.data ?? [] };
}

export default async function NewInvoicePage() {
  const { clients, services } = await getData();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nouvelle facture</h1>
      <InvoiceForm clients={clients as never} services={services as never} />
    </div>
  );
}
