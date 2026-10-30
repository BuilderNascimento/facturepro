import { NextResponse } from 'next/server';
import { IS_DEMO } from '@/lib/demo/data';

/** Preview do próximo número — NÃO consome a sequência (só ao criar a fatura). */
export async function GET() {
  if (IS_DEMO) {
    const { storePeekNextInvoiceNumber } = await import('@/lib/demo/store');
    return NextResponse.json({ invoice_number: storePeekNextInvoiceNumber() });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, error } = await supabase.rpc('peek_next_invoice_number');
  if (error) {
    // Fallback se a migração ainda não correu: calcula a partir das faturas do user
    const year = new Date().getFullYear();
    const { data: rows } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .like('invoice_number', `${year}-%`);

    let max = 0;
    for (const row of rows ?? []) {
      const m = String(row.invoice_number).match(/-(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return NextResponse.json({
      invoice_number: `${year}-${String(max + 1).padStart(4, '0')}`,
    });
  }
  return NextResponse.json({ invoice_number: data });
}

/** @deprecated Preferir GET — POST mantido para compatibilidade, também só faz peek */
export async function POST() {
  return GET();
}
