import { NextResponse } from 'next/server';
import { clientSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (IS_DEMO) {
    const { storeUpdateClient } = await import('@/lib/demo/store');
    const updated = storeUpdateClient(id, {
      company_name: parsed.data.company_name,
      contact_name: parsed.data.contact_name ?? null,
      address: parsed.data.address ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      siret: parsed.data.siret ?? null,
      vat_number: parsed.data.vat_number ?? null,
      notes: parsed.data.notes ?? null,
    });
    if (!updated) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('clients').update({
    company_name: parsed.data.company_name,
    contact_name: parsed.data.contact_name ?? null,
    address: parsed.data.address ?? null,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
    siret: parsed.data.siret ?? null,
    vat_number: parsed.data.vat_number ?? null,
    notes: parsed.data.notes ?? null,
  }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (IS_DEMO) {
    const { storeDeleteClient } = await import('@/lib/demo/store');
    storeDeleteClient(id);
    return NextResponse.json({ ok: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
