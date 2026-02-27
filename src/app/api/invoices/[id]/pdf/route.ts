import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateInvoicePdfBuffer } from '@/lib/pdf/generate-pdf';
import type { InvoicePdfData } from '@/lib/pdf/invoice-template';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

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

  const fileName = `facture-${invoice.invoice_number.replace(/\s/g, '-')}.pdf`;
  const path = `${id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('invoices')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: 'Erreur envoi Storage: ' + uploadError.message },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  await supabase
    .from('invoices')
    .update({ pdf_url: publicUrl })
    .eq('id', id);

  return NextResponse.json({ url: publicUrl });
}
