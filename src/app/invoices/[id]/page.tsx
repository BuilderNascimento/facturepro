import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { InvoiceActions } from '@/components/invoices/InvoiceActions';
import { IS_DEMO, demoInvoices, demoInvoiceItems } from '@/lib/demo/data';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard',
};

async function getInvoice(id: string) {
  if (IS_DEMO) {
    const inv = demoInvoices.find((i) => i.id === id);
    if (!inv) return null;
    const items = demoInvoiceItems.filter((i) => i.invoice_id === id);
    return { ...inv, invoice_items: items };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(*), invoice_items(*, services(*))')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !data) return null;
  return data;
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const client = (invoice as typeof demoInvoices[0]).clients;
  const items = (invoice.invoice_items ?? []) as { description: string; quantity: number; unit_price: number; total: number }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Facture {invoice.invoice_number}</h1>
          <p className="text-slate-600 mt-1">
            {client?.company_name} · {format(new Date(invoice.issue_date), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <InvoiceActions
          invoiceId={id}
          invoiceNumber={invoice.invoice_number}
          clientEmail={client?.email ?? ''}
          hasPdf={!!invoice.pdf_url}
          status={invoice.status}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800'
            : invoice.status === 'overdue' ? 'bg-red-100 text-red-800'
            : invoice.status === 'sent' ? 'bg-violet-100 text-violet-800'
            : 'bg-slate-100 text-slate-800'
          }`}>
            {statusLabels[invoice.status]}
          </span>
          <span className="text-slate-600">
            Échéance : {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Client</h3>
          <p className="font-medium text-slate-800">{client?.company_name}</p>
          {client?.address && <p className="text-slate-600 text-sm">{client.address}</p>}
          <p className="text-slate-600 text-sm">{client?.email}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Description</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Quantité</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Prix unitaire</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">{Number(item.quantity)}</td>
                  <td className="py-3 px-4 text-right">{Number(item.unit_price).toFixed(2)} €</td>
                  <td className="py-3 px-4 text-right font-medium">{Number(item.total).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="max-w-xs ml-auto space-y-1 text-right">
            <p className="flex justify-between text-slate-700">
              <span>Total HT</span><span>{Number(invoice.total_ht).toFixed(2)} €</span>
            </p>
            {Number(invoice.total_tva) > 0 && (
              <p className="flex justify-between text-slate-700">
                <span>TVA</span><span>{Number(invoice.total_tva).toFixed(2)} €</span>
              </p>
            )}
            <p className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-300">
              <span>Total TTC</span><span>{Number(invoice.total_ttc).toFixed(2)} €</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/invoices/${id}/edit`} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          Modifier
        </Link>
        <Link href="/invoices" className="text-primary-600 hover:underline">
          Retour à la liste
        </Link>
      </div>
    </div>
  );
}
