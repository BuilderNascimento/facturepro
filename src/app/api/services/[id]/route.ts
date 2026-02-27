import { NextResponse } from 'next/server';
import { serviceSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (IS_DEMO) {
    const { storeUpdateService } = await import('@/lib/demo/store');
    const updated = storeUpdateService(id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      unit_price: parsed.data.unit_price,
      unit_type: parsed.data.unit_type,
    });
    if (!updated) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('services').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeDeleteService } = await import('@/lib/demo/store');
    storeDeleteService(id);
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
