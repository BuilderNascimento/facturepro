import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RevenueLineChart } from '@/components/dashboard/RevenueLineChart';
import { FileText, CheckCircle2 } from 'lucide-react';
import { IS_DEMO } from '@/lib/demo/data';
import type { Invoice } from '@/lib/types/database';

async function getInvoices(): Promise<Invoice[]> {
  if (IS_DEMO) {
    const { storeGetInvoices } = await import('@/lib/demo/store');
    return storeGetInvoices() as Invoice[];
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('invoices')
    .select('id, status, total_ht, total_ttc, issue_date')
    .is('deleted_at', null);
  return (data ?? []) as Invoice[];
}

export default async function DashboardPage() {
  const invoices = await getInvoices();
  const now = new Date();
  const year = now.getFullYear();

  const draftInvoices = invoices.filter((i) => i.status === 'draft');
  const sentInvoices = invoices.filter((i) => i.status === 'sent');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const paidInvoices = invoices.filter((i) => i.status === 'paid');

  const draftTotal = draftInvoices.reduce((acc, i) => acc + Number(i.total_ht), 0);
  const sentTotal = sentInvoices.reduce((acc, i) => acc + Number(i.total_ht), 0);
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + Number(i.total_ht), 0);
  const paidTotal = paidInvoices.reduce((acc, i) => acc + Number(i.total_ht), 0);

  const byMonth: Record<number, { cur: number; prev: number }> = {};
  for (let m = 1; m <= 12; m++) byMonth[m] = { cur: 0, prev: 0 };

  invoices.forEach((inv) => {
    const d = new Date(inv.issue_date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    if (inv.status !== 'paid') return;
    if (y === year) byMonth[m].cur += Number(inv.total_ht);
    else if (y === year - 1) byMonth[m].prev += Number(inv.total_ht);
  });

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: format(new Date(2000, i), 'MMM', { locale: fr }),
    exerciceEnCours: Math.round(byMonth[i + 1].cur * 100) / 100,
    exercicePrecedent: Math.round(byMonth[i + 1].prev * 100) / 100,
  }));

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Accueil</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-800">
                Chiffre d&apos;affaires (HT)
              </CardTitle>
              <span className="text-sm text-slate-500">{year}</span>
            </CardHeader>
            <CardContent>
              <RevenueLineChart data={chartData} year={year} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-full bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-medium mb-1">FacturePro</p>
                  <p className="text-sm text-white/90 mb-4">
                    Solution de facturation conforme pour micro-entrepreneurs en France.
                  </p>
                  <Link href="/settings" className="text-sm font-medium text-white/95 hover:underline">
                    Configurer → 
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Documents en cours</h2>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600">
                  <FileText className="w-5 h-5" />
                </span>
                <CardTitle className="text-base">Factures</CardTitle>
              </div>
              <Link href="/invoices/new" className="text-sm font-medium text-primary-600 hover:underline">
                + Ajouter
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Brouillon', value: draftTotal, count: draftInvoices.length, color: 'text-slate-800' },
                { label: 'En Attente', value: sentTotal, count: sentInvoices.length, color: 'text-slate-800' },
                { label: 'En Retard', value: overdueTotal, count: overdueInvoices.length, color: 'text-red-600' },
                { label: 'Payées', value: paidTotal, count: paidInvoices.length, color: 'text-emerald-600' },
              ].map(({ label, value, count, color }) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className={`mt-1 text-lg font-semibold ${color}`}>{value.toFixed(2)} € HT</p>
                  <p className="text-sm text-slate-500">{count} document{count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dernières factures</CardTitle>
          <Link href="/invoices" className="text-sm text-primary-600 hover:underline">Voir tout</Link>
        </CardHeader>
        <CardContent>
          {!recentInvoices.length ? (
            <p className="text-slate-500 text-sm">Aucune facture.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentInvoices.map((inv) => (
                <li key={inv.id} className="py-3 flex justify-between items-center">
                  <div>
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-primary-600 hover:underline">
                      {inv.invoice_number}
                    </Link>
                    <span className="text-slate-500 text-sm ml-2">
                      {format(new Date(inv.issue_date), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 font-medium">{Number(inv.total_ttc).toFixed(2)} €</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-800'
                      : inv.status === 'overdue' ? 'bg-red-100 text-red-800'
                      : inv.status === 'sent' ? 'bg-violet-100 text-violet-800'
                      : 'bg-slate-100 text-slate-800'
                    }`}>
                      {statusLabels[inv.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
