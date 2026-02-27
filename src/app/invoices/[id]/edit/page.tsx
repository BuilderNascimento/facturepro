import { notFound } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IS_DEMO, demoClients, demoServices, demoInvoices, demoInvoiceItems } from '@/lib/demo/data';

async function getData(id: string) {
  const clientsList = IS_DEMO
    ? demoClients.map((c) => ({ id: c.id, company_name: c.company_name, email: c.email }))
    : null;
  const servicesList = IS_DEMO
    ? demoServices.map((s) => ({ id: s.id, name: s.name, unit_price: s.unit_price, unit_type: s.unit_type }))
    : null;

  if (IS_DEMO) {
    const inv = demoInvoices.find((i) => i.id === id);
    if (!inv) return null;
    const items = demoInvoiceItems.filter((i) => i.invoice_id === id).map((i) => ({
      service_id: i.service_id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));
    return {
      invoice: { id: inv.id, invoice_number: inv.invoice_number, client_id: inv.client_id, issue_date: inv.issue_date, due_date: inv.due_date, status: inv.status, items },
      clients: clientsList!,
      services: servicesList!,
    };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_id, issue_date, due_date, status, invoice_items(id, service_id, description, quantity, unit_price, services(*))')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !invoice) return null;
  const [cr, sr] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('services').select('id, name, unit_price, unit_type').order('name'),
  ]);
  const items = ((invoice as { invoice_items?: unknown[] }).invoice_items ?? []).map((i: unknown) => {
    const row = i as { service_id: string | null; description: string; quantity: number; unit_price: number };
    return { service_id: row.service_id, description: row.description, quantity: row.quantity, unit_price: row.unit_price };
  });
  return {
    invoice: { id: invoice.id, invoice_number: invoice.invoice_number, client_id: invoice.client_id, issue_date: invoice.issue_date, due_date: invoice.due_date, status: invoice.status, items },
    clients: cr.data ?? [],
    services: sr.data ?? [],
  };
}

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Modifier la facture {data.invoice.invoice_number}</h1>
      <InvoiceForm invoice={data.invoice} clients={data.clients as never} services={data.services as never} />
    </div>
  );
}
