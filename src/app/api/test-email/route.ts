import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/send-welcome-email';
import { sendPaymentFailedEmail } from '@/lib/email/send-payment-failed-email';

// Rota apenas para testes — remover em produção
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');
  const type = searchParams.get('type') ?? 'welcome';

  if (!to) {
    return NextResponse.json({ error: 'Parâmetro "to" obrigatório. Ex: /api/test-email?to=seuemail@gmail.com&type=welcome' }, { status: 400 });
  }

  try {
    if (type === 'payment_failed') {
      await sendPaymentFailedEmail(to);
    } else {
      await sendWelcomeEmail(to);
    }
    return NextResponse.json({ ok: true, sent_to: to, type });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
