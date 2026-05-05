import { NextResponse } from 'next/server';
import { invoiceSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const tvaRate = parsed.data.tva_rate ?? 0;
  const totalHt = parsed.data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const totalTva = Math.round(totalHt * tvaRate) / 100;
  const totalTtc = totalHt + totalTva;
  const description = parsed.data.description?.trim() ? parsed.data.description.trim() : null;

  if (IS_DEMO) {
    const { storeGetNextInvoiceNumber, storeCreateInvoice } = await import('@/lib/demo/store');
    const invoiceNumber = storeGetNextInvoiceNumber();
    const invoice = storeCreateInvoice(
      {
        invoice_number: invoiceNumber,
        client_id: parsed.data.client_id,
        issue_date: parsed.data.issue_date,
        due_date: parsed.data.due_date,
        status: parsed.data.status,
        description,
        tva_rate: tvaRate,
        total_ht: totalHt,
        total_tva: totalTva,
        total_ttc: totalTtc,
      },
      parsed.data.items.map((item) => ({
        service_id: item.service_id ?? null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })),
    );
    return NextResponse.json({ id: invoice.id });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: numData, error: numError } = await supabase.rpc('get_next_invoice_number');
  if (numError || !numData) {
    return NextResponse.json({ error: numError?.message ?? 'Impossible de générer le numéro' }, { status: 500 });
  }

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: numData,
      client_id: parsed.data.client_id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      status: parsed.data.status,
      description,
      tva_rate: tvaRate,
      total_ht: totalHt,
      total_tva: totalTva,
      total_ttc: totalTtc,
    })
    .select('id')
    .single();

  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 });

  const items = parsed.data.items.map((item) => ({
    invoice_id: invoice.id,
    service_id: item.service_id ?? null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(items);
  if (itemsError) {
    await supabase.from('invoices').delete().eq('id', invoice.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ id: invoice.id });
}
