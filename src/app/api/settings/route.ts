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
    // Fields locked once SIRET is set — only editable via support
    const LOCKED_FIELDS = ['company_name', 'siret', 'legal_status', 'ape_naf'];
    const isLocked = !!(existing as { siret?: string | null }).siret;

    const allData = parsed.data as Record<string, unknown>;
    const updateData = isLocked
      ? Object.fromEntries(Object.entries(allData).filter(([k]) => !LOCKED_FIELDS.includes(k)))
      : allData;

    const { error } = await supabase
      .from('company_settings')
      .update(updateData)
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('company_settings')
      .insert({ ...(parsed.data as Record<string, unknown>), user_id: user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
