import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // Fetch original invoice + items
  const { data: original, error: origError } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (origError || !original) {
    return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
  }

  // Get next invoice number
  const { data: numData, error: numError } = await supabase.rpc('get_next_invoice_number');
  if (numError || !numData) {
    return NextResponse.json({ error: 'Erro ao gerar número de fatura' }, { status: 500 });
  }

  // Create duplicate invoice as draft with today's date
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: newInvoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: numData,
      client_id: original.client_id,
      issue_date: today,
      due_date: dueDate,
      status: 'draft',
      description: (original as { description?: string | null }).description ?? null,
      tva_rate: original.tva_rate ?? 0,
      total_ht: original.total_ht,
      total_tva: original.total_tva,
      total_ttc: original.total_ttc,
    })
    .select('id')
    .single();

  if (invError || !newInvoice) {
    return NextResponse.json({ error: invError?.message ?? 'Erro ao criar fatura' }, { status: 500 });
  }

  // Copy items
  const items = (original.invoice_items ?? []).map((item: {
    service_id: string | null; description: string; quantity: number; unit_price: number; total: number;
  }) => ({
    invoice_id: newInvoice.id,
    service_id: item.service_id ?? null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
  }));

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(items);
    if (itemsError) {
      await supabase.from('invoices').delete().eq('id', newInvoice.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: newInvoice.id });
}
