import { createClient } from '@/lib/supabase/server';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const [clientsRes, servicesRes] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('services').select('id, name, unit_price, unit_type').order('name'),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nouvelle facture</h1>
      <InvoiceForm
        clients={clientsRes.data ?? []}
        services={servicesRes.data ?? []}
      />
    </div>
  );
}
