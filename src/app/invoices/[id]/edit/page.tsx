import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      client_id,
      issue_date,
      due_date,
      status,
      invoice_items (id, service_id, description, quantity, unit_price, services (*))
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !invoice) notFound();

  const clientsRes = await supabase.from('clients').select('id, company_name, email').order('company_name');
  const servicesRes = await supabase.from('services').select('id, name, unit_price, unit_type').order('name');

  const items = (invoice.invoice_items ?? []).map((i: { service_id: string | null; description: string; quantity: number; unit_price: number; services: unknown }) => ({
    service_id: i.service_id,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Modifier la facture {invoice.invoice_number}</h1>
      <InvoiceForm
        invoice={{
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_id: invoice.client_id,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          status: invoice.status,
          items,
        }}
        clients={clientsRes.data ?? []}
        services={servicesRes.data ?? []}
      />
    </div>
  );
}
