import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RevenueLineChart } from '@/components/dashboard/RevenueLineChart';
import { FileText, CheckCircle2, TrendingUp, Clock, AlertTriangle, BadgeCheck, Plus } from 'lucide-react';
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
    draft: 'Rascunho', sent: 'Em Espera', paid: 'Paga', overdue: 'Em Atraso',
  };

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearInvoices = invoices.filter((i) => new Date(i.issue_date).getFullYear() === currentYear);
  const totalFaturadoHT = yearInvoices.reduce((a, i) => a + Number(i.total_ht), 0);
  const totalFaturadoTTC = yearInvoices.reduce((a, i) => a + Number(i.total_ttc), 0);
  const totalRecebido = yearInvoices.filter((i) => i.status === 'paid').reduce((a, i) => a + Number(i.total_ht), 0);
  const totalPendente = yearInvoices.filter((i) => i.status === 'sent').reduce((a, i) => a + Number(i.total_ht), 0);
  const totalEmAtraso = yearInvoices.filter((i) => i.status === 'overdue').reduce((a, i) => a + Number(i.total_ht), 0);
  const percentPago = totalFaturadoHT > 0 ? Math.round((totalRecebido / totalFaturadoHT) * 100) : 0;

  const monthName = format(new Date(currentYear, currentMonth), 'MMMM yyyy', { locale: fr });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Início</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthName}</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 shadow-md shadow-primary-200 transition"
        >
          <Plus className="w-4 h-4" />
          Fazer fatura
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-lg bg-primary-50"><TrendingUp className="w-4 h-4 text-primary-600" /></span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Faturado {currentYear}</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalFaturadoHT.toFixed(0)} €</p>
          <p className="text-xs text-slate-400 mt-0.5">TTC: {totalFaturadoTTC.toFixed(0)} €</p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-lg bg-emerald-50"><BadgeCheck className="w-4 h-4 text-emerald-600" /></span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recebido</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{totalRecebido.toFixed(0)} €</p>
          <p className="text-xs text-emerald-600 mt-0.5 font-medium">{percentPago}% do total</p>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-lg bg-violet-50"><Clock className="w-4 h-4 text-violet-600" /></span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-violet-700">{totalPendente.toFixed(0)} €</p>
          <p className="text-xs text-slate-400 mt-0.5">{sentInvoices.length} fatura{sentInvoices.length !== 1 ? 's' : ''} enviada{sentInvoices.length !== 1 ? 's' : ''}</p>
        </div>

        <div className={`bg-white rounded-xl border shadow-sm p-5 ${totalEmAtraso > 0 ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`p-2 rounded-lg ${totalEmAtraso > 0 ? 'bg-red-100' : 'bg-slate-50'}`}>
              <AlertTriangle className={`w-4 h-4 ${totalEmAtraso > 0 ? 'text-red-600' : 'text-slate-400'}`} />
            </span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Em Atraso</span>
          </div>
          <p className={`text-2xl font-bold ${totalEmAtraso > 0 ? 'text-red-700' : 'text-slate-400'}`}>{totalEmAtraso.toFixed(0)} €</p>
          <p className="text-xs text-slate-400 mt-0.5">{overdueInvoices.length} fatura{overdueInvoices.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Barra de progresso pago vs pendente */}
      {totalFaturadoHT > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Progresso de recebimentos {currentYear}</span>
            <span className="text-sm font-bold text-slate-700">{percentPago}% recebido</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all"
              style={{ width: `${percentPago}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1.5">
            <span>Recebido: {totalRecebido.toFixed(2)} €</span>
            <span>Total: {totalFaturadoHT.toFixed(2)} €</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-800">
                Faturamento (HT)
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
                  <p className="font-medium mb-1">FactureProBR</p>
                  <p className="text-sm text-white/90 mb-4">
                    Faturas profissionais no padrão francês para brasileiros na França.
                  </p>
                  <Link href="/settings" className="text-sm font-medium text-white/95 hover:underline">
                    Configurar →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Faturas em curso</h2>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600">
                  <FileText className="w-5 h-5" />
                </span>
                <CardTitle className="text-base">Faturas</CardTitle>
              </div>
              <Link href="/invoices/new" className="text-sm font-medium text-primary-600 hover:underline">
                + Nova fatura
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Rascunho', value: draftTotal, count: draftInvoices.length, color: 'text-slate-800' },
                { label: 'Em Espera', value: sentTotal, count: sentInvoices.length, color: 'text-slate-800' },
                { label: 'Em Atraso', value: overdueTotal, count: overdueInvoices.length, color: 'text-red-600' },
                { label: 'Pagas', value: paidTotal, count: paidInvoices.length, color: 'text-emerald-600' },
              ].map(({ label, value, count, color }) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className={`mt-1 text-lg font-semibold ${color}`}>{value.toFixed(2)} € HT</p>
                  <p className="text-sm text-slate-500">{count} fatura{count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimas faturas</CardTitle>
          <Link href="/invoices" className="text-sm text-primary-600 hover:underline">Ver todas</Link>
        </CardHeader>
        <CardContent>
          {!recentInvoices.length ? (
            <p className="text-slate-500 text-sm">Nenhuma fatura ainda.</p>
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
