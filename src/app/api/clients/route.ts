import { NextResponse } from 'next/server';
import { clientSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const payload = {
      company_name: parsed.data.company_name,
      contact_name: parsed.data.contact_name ?? null,
      address: parsed.data.address ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone ?? null,
      siret: parsed.data.siret ?? null,
      vat_number: parsed.data.vat_number ?? null,
      notes: parsed.data.notes ?? null,
    };

    if (IS_DEMO) {
      const { storeCreateClient } = await import('@/lib/demo/store');
      const client = storeCreateClient(payload);
      return NextResponse.json(client);
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: `${error.message} (code: ${error.code})` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Exceção: ${msg}` }, { status: 500 });
  }
}
