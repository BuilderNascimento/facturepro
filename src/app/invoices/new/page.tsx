import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { IS_DEMO } from '@/lib/demo/data';
import Link from 'next/link';

async function getData() {
  if (IS_DEMO) {
    const { storeGetClients, storeGetProperties } = await import('@/lib/demo/store');
    const clients = storeGetClients().map((c) => ({ id: c.id, company_name: c.company_name, email: c.email }));
    const properties = storeGetProperties().map((p) => ({
      id: p.id, client_id: p.client_id, name: p.name,
      normal_price: p.normal_price, extra_price: p.extra_price,
      clients: p.clients ? { company_name: p.clients.company_name } : null,
    }));
    return { clients, properties, settingsOk: true };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const [clientsRes, propertiesRes, settingsRes] = await Promise.all([
    supabase.from('clients').select('id, company_name, email').order('company_name'),
    supabase.from('properties').select('id, client_id, name, normal_price, extra_price, clients(company_name)').order('name'),
    supabase.from('company_settings').select('company_name, siret').limit(1).maybeSingle(),
  ]);
  const s = settingsRes.data;
  const settingsOk = !!(s?.company_name);
  return {
    clients: clientsRes.data ?? [],
    properties: propertiesRes.data ?? [],
    settingsOk,
  };
}

export default async function NewInvoicePage() {
  const { clients, properties, settingsOk } = await getData();

  if (!settingsOk) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Nova fatura</h1>
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 max-w-xl">
          <h2 className="font-bold text-amber-800 text-lg mb-2">⚙️ Configure a sua empresa primeiro</h2>
          <p className="text-amber-700 text-sm mb-4">
            Para emitir faturas no padrão francês, precisa de preencher os dados da sua empresa (nome, SIRET, endereço) nas configurações.
          </p>
          <Link href="/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700">
            Ir para Configurações →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nova fatura</h1>
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        🇫🇷 <span>Fatura gerada em padrão profissional francês · Compatível com legislação francesa · Conforme art. 293B du CGI</span>
      </p>
      <InvoiceForm clients={clients as never} properties={properties as never} />
    </div>
  );
}
