import { IS_DEMO } from '@/lib/demo/data';
import { InvoicesListClient } from '@/components/invoices/InvoicesListClient';

async function getInvoices() {
  if (IS_DEMO) {
    const { storeGetInvoices } = await import('@/lib/demo/store');
    return storeGetInvoices();
  }
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
      const clientName = (inv as { clients?: { company_name?: string } | null }).clients?.company_name ?? '—';
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
      <h1 className="text-2xl font-bold text-slate-800">Faturas</h1>
      <InvoicesListClient rows={rows} />
    </div>
  );
}
