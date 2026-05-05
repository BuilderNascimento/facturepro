import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSubscriptionActive } from '@/lib/stripe';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ active: false });
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const isActive = sub
      ? isSubscriptionActive(String(sub.status ?? ''), sub.current_period_end ?? null)
      : false;

    return NextResponse.json({ active: !!isActive });
  } catch {
    return NextResponse.json({ active: false });
  }
}
