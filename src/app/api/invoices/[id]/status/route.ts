import { NextResponse } from 'next/server';
import { z } from 'zod';

const statusEnum = z.enum(['draft', 'sent', 'paid', 'overdue']);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = statusEnum.safeParse(body.status);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase
    .from('invoices')
    .update({ status: parsed.data })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
