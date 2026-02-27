import Link from 'next/link';
import { IS_DEMO, demoInvoices } from '@/lib/demo/data';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { InvoicesFilters } from '@/components/invoices/InvoicesFilters';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'En Attente',
  paid: 'Payée',
  overdue: 'En Retard',
};

async function getInvoices() {
  if (IS_DEMO) return demoInvoices;
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, issue_date, due_date, status, total_ht, total_ttc, clients(company_name)')
    .is('deleted_at', null)
    .order('issue_date', { ascending: false });
  return data ?? [];
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const rows = [...invoices]
    .sort((a, b) => new Date(b.issue_date ?? '').getTime() - new Date(a.issue_date ?? '').getTime())
    .map((inv) => {
      const clientName = IS_DEMO
        ? (inv as typeof demoInvoices[0]).clients?.company_name ?? '—'
        : ((inv as Record<string, unknown>).clients as { company_name?: string } | null)?.company_name ?? '—';
      const due = new Date(inv.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const displayStatus = inv.status === 'sent' && daysUntilDue >= 0 && daysUntilDue <= 7 ? 'echeance' : inv.status;
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        reference: `F-${inv.invoice_number}`,
        client: clientName,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        status: inv.status,
        displayStatus,
        total_ht: Number(inv.total_ht),
        total_ttc: Number(inv.total_ttc),
      };
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
      <InvoicesFilters />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {!rows.length ? (
          <div className="p-12 text-center text-slate-500">
            Aucun document. <Link href="/invoices/new" className="text-primary-600 hover:underline">Créer une facture</Link>
          </div>
        ) : (
          <InvoicesTable rows={rows} statusLabels={statusLabels} />
        )}
      </div>
    </div>
  );
}
