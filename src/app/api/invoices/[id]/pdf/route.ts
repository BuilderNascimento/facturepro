import { NextResponse } from 'next/server';
import { IS_DEMO } from '@/lib/demo/data';
import { getInvoiceHtml } from '@/lib/pdf/invoice-template';
import type { InvoicePdfData } from '@/lib/pdf/invoice-template';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let pdfData: InvoicePdfData | null = null;

    if (IS_DEMO) {
      const { storeGetInvoice, storeGetClients } = await import('@/lib/demo/store');
      const invoice = storeGetInvoice(id);
      if (!invoice) return new NextResponse('Not found', { status: 404 });
      const client = invoice.clients;
      pdfData = {
        company: { company_name: 'Mon Entreprise' },
        client: {
          company_name: client?.company_name ?? '',
          contact_name: client?.contact_name ?? null,
          address: client?.address ?? null,
          email: client?.email ?? null,
          phone: client?.phone ?? null,
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
        items: invoice.invoice_items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          total: Number(i.quantity) * Number(i.unit_price),
        })),
      };
    } else {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      const [settingsRes, invoiceRes] = await Promise.all([
        supabase.from('company_settings').select('*').limit(1).maybeSingle(),
        supabase.from('invoices')
          .select('*, clients(*), invoice_items(*)')
          .eq('id', id)
          .is('deleted_at', null)
          .single(),
      ]);

      if (invoiceRes.error || !invoiceRes.data) {
        return new NextResponse('Facture introuvable', { status: 404 });
      }

      const invoice = invoiceRes.data;
      const settings = settingsRes.data;
      const client = invoice.clients as Record<string, unknown> | null;

      pdfData = {
        company: settings
          ? {
              company_name: settings.company_name,
              legal_status: settings.legal_status,
              siret: settings.siret,
              ape_naf: (settings as Record<string, unknown>).ape_naf as string | null,
              address: settings.address,
              email: settings.email,
              phone: settings.phone,
              iban: settings.iban,
              bic: settings.bic,
              bank_name: (settings as Record<string, unknown>).bank_name as string | null,
              vat_number: settings.vat_number,
              legal_text_default: settings.legal_text_default,
              indemnity_text_default: settings.indemnity_text_default,
              late_penalty_rate: settings.late_penalty_rate,
            }
          : { company_name: '' },
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
        items: ((invoice.invoice_items ?? []) as { description: string; quantity: number; unit_price: number }[]).map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          total: Number(i.quantity) * Number(i.unit_price),
        })),
      };
    }

    const html = getInvoiceHtml(pdfData);
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new NextResponse(msg, { status: 500 });
  }
}
