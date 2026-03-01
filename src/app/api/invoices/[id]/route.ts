import { NextResponse } from 'next/server';
import { invoiceSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeGetInvoice } = await import('@/lib/demo/store');
    const invoice = storeGetInvoice(id);
    if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    return NextResponse.json(invoice);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, clients (*), invoice_items (*, services (*))')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const tvaRate = parsed.data.tva_rate ?? 0;
  const totalHt = parsed.data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const totalTva = Math.round(totalHt * tvaRate) / 100;
  const totalTtc = totalHt + totalTva;

  if (IS_DEMO) {
    const { storeUpdateInvoice } = await import('@/lib/demo/store');
    const updated = storeUpdateInvoice(
      id,
      {
        client_id: parsed.data.client_id,
        issue_date: parsed.data.issue_date,
        due_date: parsed.data.due_date,
        status: parsed.data.status,
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
    if (!updated) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true, id });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error: invError } = await supabase
    .from('invoices')
    .update({ client_id: parsed.data.client_id, issue_date: parsed.data.issue_date, due_date: parsed.data.due_date, status: parsed.data.status, tva_rate: tvaRate, total_ht: totalHt, total_tva: totalTva, total_ttc: totalTtc })
    .eq('id', id)
    .is('deleted_at', null);

  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 });

  await supabase.from('invoice_items').delete().eq('invoice_id', id);
  const items = parsed.data.items.map((item) => ({
    invoice_id: id,
    service_id: item.service_id ?? null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
  }));
  const { error: itemsError } = await supabase.from('invoice_items').insert(items);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeSoftDeleteInvoice } = await import('@/lib/demo/store');
    storeSoftDeleteInvoice(id);
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
