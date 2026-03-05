import { NextResponse } from 'next/server';
import { IS_DEMO } from '@/lib/demo/data';

export async function POST() {
  if (IS_DEMO) {
    const { storeGetNextInvoiceNumber } = await import('@/lib/demo/store');
    const invoice_number = storeGetNextInvoiceNumber();
    return NextResponse.json({ invoice_number });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, error } = await supabase.rpc('get_next_invoice_number');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice_number: data });
}
