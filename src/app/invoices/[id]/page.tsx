import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { InvoiceActions } from '@/components/invoices/InvoiceActions';
import { DuplicateButton } from '@/components/invoices/DuplicateButton';
import { IS_DEMO } from '@/lib/demo/data';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', paid: 'Paga', overdue: 'Em Atraso',
};

async function getInvoice(id: string) {
  if (IS_DEMO) {
    const { storeGetInvoice } = await import('@/lib/demo/store');
    return storeGetInvoice(id);
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

  const client = (invoice as { clients?: { company_name?: string; address?: string | null; email?: string | null; phone?: string | null } | null }).clients;
  const items = (invoice.invoice_items ?? []) as { description: string; quantity: number; unit_price: number; total: number }[];
  const freeDescription = (invoice as { description?: string | null }).description;

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
            Vencimento: {format(new Date(invoice.due_date), 'd MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Client</h3>
          <p className="font-medium text-slate-800">{client?.company_name}</p>
          {client?.address && <p className="text-slate-600 text-sm">{client.address}</p>}
          {client?.email && <p className="text-slate-600 text-sm">{client.email}</p>}
          {client?.phone && <p className="text-slate-600 text-sm">{client.phone}</p>}
        </div>

        {freeDescription ? (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Descrição</h3>
            <div className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-lg p-4">
              {freeDescription}
            </div>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Description</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Quantidade</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Preço unitário</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-slate-700">{item.description}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{Number(item.quantity)}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{Number(item.unit_price).toFixed(2)} €</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800">{Number(item.quantity * item.unit_price).toFixed(2)} €</td>
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
            {Number(invoice.total_tva) > 0 ? (
              <>
                <p className="flex justify-between text-slate-700">
                  <span>TVA {(invoice as { tva_rate?: number }).tva_rate ? `(${(invoice as { tva_rate?: number }).tva_rate}%)` : ''}</span>
                  <span>{Number(invoice.total_tva).toFixed(2)} €</span>
                </p>
                <p className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-300">
                  <span>Total TTC</span><span>{Number(invoice.total_ttc).toFixed(2)} €</span>
                </p>
              </>
            ) : (
              <>
                <p className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-300">
                  <span>Total</span><span>{Number(invoice.total_ht).toFixed(2)} €</span>
                </p>
                <p className="text-xs text-slate-500 pt-1">TVA non applicable, art. 293B du CGI</p>
              </>
            )}
          </div>
        </div>
      </div>

      {invoice.status !== 'draft' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold">Fatura emitida — não pode ser alterada</p>
            <p className="text-amber-700 mt-0.5">Conforme a legislação francesa, faturas enviadas ou pagas não podem ser modificadas. Para corrigir, crie uma nota de crédito ou duplique a fatura.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {invoice.status === 'draft' ? (
          <Link href={`/invoices/${id}/edit`} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">
            ✏️ Editar rascunho
          </Link>
        ) : (
          <span className="px-4 py-2 border border-slate-200 rounded-lg text-slate-400 text-sm cursor-not-allowed bg-slate-50">
            🔒 Edição bloqueada
          </span>
        )}
        <DuplicateButton invoiceId={id} />
        <Link href="/invoices" className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm">
          ← Voltar à lista
        </Link>
      </div>
    </div>
  );
}
