import { resend, FROM_EMAIL } from './resend-client';

export interface SendInvoiceEmailOptions {
  to: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  pdfBuffer,
}: SendInvoiceEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Facture ${invoiceNumber} — FactureProBR`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#111827;max-width:480px;margin:0 auto">
        <h2 style="color:#1d4ed8">Facture ${invoiceNumber}</h2>
        <p>Veuillez trouver ci-joint la facture <strong>${invoiceNumber}</strong>.</p>
        <p style="color:#6b7280;font-size:13px">
          Ce document a été généré via FactureProBR, conforme aux exigences fiscales françaises.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `facture-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }
}
