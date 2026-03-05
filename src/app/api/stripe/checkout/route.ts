import { NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Max 5 checkout attempts per IP per 10 minutes
  if (!rateLimit(getClientIp(request), 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });
  }
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: user.email,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://factureprobr.xyz'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://factureprobr.xyz'}/subscribe?cancelled=true`,
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
