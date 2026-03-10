import { NextResponse } from 'next/server';
import { propertySchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function GET() {
  if (IS_DEMO) {
    const { storeGetProperties } = await import('@/lib/demo/store');
    return NextResponse.json(storeGetProperties());
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*, clients(id, company_name, contact_name)')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (IS_DEMO) {
    const { storeCreateProperty } = await import('@/lib/demo/store');
    const property = storeCreateProperty({
      client_id: parsed.data.client_id,
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      normal_price: parsed.data.normal_price,
      extra_price: parsed.data.extra_price,
      notes: parsed.data.notes ?? null,
    });
    return NextResponse.json(property);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await supabase.from('properties').insert({ ...parsed.data, user_id: user.id }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
