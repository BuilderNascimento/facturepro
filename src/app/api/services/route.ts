import { NextResponse } from 'next/server';
import { serviceSchema } from '@/lib/validations/schemas';
import { IS_DEMO } from '@/lib/demo/data';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (IS_DEMO) {
    const { storeCreateService } = await import('@/lib/demo/store');
    const service = storeCreateService({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      unit_price: parsed.data.unit_price,
      unit_type: parsed.data.unit_type,
    });
    return NextResponse.json(service);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data, error } = await supabase.from('services').insert({ ...parsed.data, user_id: user.id }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
