import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateInvoicePdfBuffer } from '@/lib/pdf/generate-pdf';
import type { InvoicePdfData } from '@/lib/pdf/invoice-template';
import { sendInvoiceEmail } from '@/lib/email/send-invoice-email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Max 10 emails per IP per hour
  if (!rateLimit(getClientIp(request), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Limite de envios atingido. Tente novamente em 1 hora.' }, { status: 429 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const to = body.to as string | undefined;
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Adresse email (to) requise' }, { status: 400 });
  }

  const { data: settings } = await supabase
    .from('company_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (*),
      invoice_items (*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (invError || !invoice) {
    return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  }

  if (!settings) {
    return NextResponse.json({ error: 'Configurez les paramètres de l’entreprise' }, { status: 400 });
  }

  const client = invoice.clients as Record<string, unknown> | null;
  const items = (invoice.invoice_items ?? []).map((i: { description: string; quantity: number; unit_price: number; total: number }) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unit_price: Number(i.unit_price),
    total: Number(i.total),
  }));

  const pdfData: InvoicePdfData = {
    company: {
      company_name: settings.company_name,
      legal_status: settings.legal_status,
      siret: settings.siret,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      iban: settings.iban,
      bic: settings.bic,
      vat_number: settings.vat_number,
      legal_text_default: settings.legal_text_default,
      indemnity_text_default: settings.indemnity_text_default,
      late_penalty_rate: settings.late_penalty_rate,
    },
    client: {
      company_name: (client?.company_name as string) ?? '',
      contact_name: (client?.contact_name as string) ?? null,
      address: (client?.address as string) ?? null,
      email: (client?.email as string) ?? null,
      phone: (client?.phone as string) ?? null,
      siret: (client?.siret as string) ?? null,
      vat_number: (client?.vat_number as string) ?? null,
    },
    invoice: {
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      total_ht: Number(invoice.total_ht),
      total_tva: Number(invoice.total_tva),
      total_ttc: Number(invoice.total_ttc),
    },
    items,
  };

  let buffer: Buffer;
  try {
    buffer = await generateInvoicePdfBuffer(pdfData);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur génération PDF' },
      { status: 500 }
    );
  }

  try {
    await sendInvoiceEmail({
      to,
      invoiceNumber: invoice.invoice_number,
      pdfBuffer: buffer,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erreur envoi email' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
