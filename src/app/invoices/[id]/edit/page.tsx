import { notFound } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IS_DEMO } from '@/lib/demo/data';
import type { Property } from '@/lib/types/database';

async function getData(id: string) {
  if (IS_DEMO) {
    const { storeGetClients, storeGetProperties, storeGetInvoice } = await import('@/lib/demo/store');
    const inv = storeGetInvoice(id);
    if (!inv) return null;
    const clients = storeGetClients().map((c) => ({ id: c.id, company_name: c.company_name, email: c.email }));
    const properties = storeGetProperties().map((p) => ({
      id: p.id,
      client_id: p.client_id,
      name: p.name,
      normal_price: p.normal_price,
      extra_price: p.extra_price,
      clients: p.clients,
    }));
    const items = inv.invoice_items.map((i) => ({
      service_id: i.service_id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));
    return {
      invoice: { id: inv.id, invoice_number: inv.invoice_number, client_id: inv.client_id, issue_date: inv.issue_date, due_date: inv.due_date, status: inv.status, description: inv.description ?? null, items },
      clients,
      properties,
    };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_id, issue_date, due_date, status, description, invoice_items(id, service_id, description, quantity, unit_price)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !invoice) return null;
  const [cr, pr] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('properties').select('id, client_id, name, normal_price, extra_price, clients(id, company_name)').order('name'),
  ]);
  const items = ((invoice as { invoice_items?: unknown[] }).invoice_items ?? []).map((i: unknown) => {
    const row = i as { service_id: string | null; description: string; quantity: number; unit_price: number };
    return { service_id: row.service_id, description: row.description, quantity: row.quantity, unit_price: row.unit_price };
  });
  return {
    invoice: { id: invoice.id, invoice_number: invoice.invoice_number, client_id: invoice.client_id, issue_date: invoice.issue_date, due_date: invoice.due_date, status: invoice.status, description: (invoice as { description?: string | null }).description ?? null, items },
    clients: cr.data ?? [],
    properties: (pr.data ?? []) as unknown as Property[],
  };
}

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Editar fatura {data.invoice.invoice_number}</h1>
      <InvoiceForm invoice={data.invoice} clients={data.clients as never} properties={data.properties as never} />
    </div>
  );
}
