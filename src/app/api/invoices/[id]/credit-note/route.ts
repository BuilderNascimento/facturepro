import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  reason: z.string().trim().min(3, 'Motivo obrigatório').max(500),
});

// Cria uma nota de crédito (avoir) total para uma fatura emitida.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: original } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!original) return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
  if (original.document_type === 'credit_note') {
    return NextResponse.json({ error: 'Não é possível emitir nota de crédito sobre outra nota de crédito' }, { status: 400 });
  }
  if (original.status === 'draft') {
    return NextResponse.json({ error: 'Rascunhos não precisam de nota de crédito: edite ou apague o rascunho' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('credited_invoice_id', id)
    .eq('document_type', 'credit_note')
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: `Já existe a nota de crédito ${existing.invoice_number} para esta fatura`, id: existing.id },
      { status: 409 },
    );
  }

  const { data: numData, error: numError } = await supabase.rpc('get_next_invoice_number');
  if (numError || !numData) {
    return NextResponse.json({ error: 'Erro ao gerar número' }, { status: 500 });
  }

  const today = new Date().toISOString().split('T')[0];
  const description = `Avoir pour la facture ${original.invoice_number} — ${parsed.data.reason}`;

  // Rascunho primeiro: as linhas só podem ser inseridas enquanto não está emitida.
  const { data: note, error: noteError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: numData,
      client_id: original.client_id,
      issue_date: today,
      due_date: today,
      status: 'draft',
      description,
      tva_rate: original.tva_rate ?? 0,
      total_ht: -Number(original.total_ht),
      total_tva: -Number(original.total_tva),
      total_ttc: -Number(original.total_ttc),
      document_type: 'credit_note',
      credited_invoice_id: original.id,
      credit_reason: parsed.data.reason,
    })
    .select('id')
    .single();

  if (noteError || !note) {
    const duplicate = noteError?.code === '23505';
    return NextResponse.json(
      { error: duplicate ? 'Já existe uma nota de crédito para esta fatura' : (noteError?.message ?? 'Erro ao criar nota de crédito') },
      { status: duplicate ? 409 : 500 },
    );
  }

  const items = (original.invoice_items ?? []).map((item: {
    service_id: string | null; description: string; quantity: number; unit_price: number;
  }) => ({
    invoice_id: note.id,
    service_id: item.service_id ?? null,
    description: item.description,
    quantity: -Number(item.quantity),
    unit_price: Number(item.unit_price),
    total: -Number(item.quantity) * Number(item.unit_price),
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(items);
  if (itemsError) {
    await supabase.from('invoices').delete().eq('id', note.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { error: issueError } = await supabase.from('invoices').update({ status: 'sent' }).eq('id', note.id);
  if (issueError) return NextResponse.json({ error: issueError.message }, { status: 500 });

  return NextResponse.json({ id: note.id });
}
