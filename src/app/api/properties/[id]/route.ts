import { NextResponse } from 'next/server';
import { propertySchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeGetProperty } = await import('@/lib/demo/store');
    const property = storeGetProperty(id);
    if (!property) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(property);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, clients(id, company_name)')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (IS_DEMO) {
    const { storeUpdateProperty } = await import('@/lib/demo/store');
    const updated = storeUpdateProperty(id, {
      client_id: parsed.data.client_id,
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      normal_price: parsed.data.normal_price,
      extra_price: parsed.data.extra_price,
      notes: parsed.data.notes ?? null,
    });
    if (!updated) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('properties').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeDeleteProperty } = await import('@/lib/demo/store');
    storeDeleteProperty(id);
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
