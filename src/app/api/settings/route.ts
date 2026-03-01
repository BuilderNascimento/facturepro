import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { companySettingsSchema } from '@/lib/validations/schemas';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json();
  const parsed = companySettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('company_settings')
    .select('id, siret, company_name')
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Lock core identity fields once SIRET is set — requires support to change
    const isLocked = !!(existing as { siret?: string | null }).siret;
    const updateData = isLocked
      ? (({ company_name: _cn, siret: _s, legal_status: _ls, ape_naf: _an, ...rest }) => rest)(parsed.data as Record<string, unknown>)
      : parsed.data;
    const { error } = await supabase
      .from('company_settings')
      .update(updateData)
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('company_settings')
      .insert(parsed.data);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
