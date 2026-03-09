import { resend, FROM_EMAIL } from './resend-client';

export interface SendInvoiceEmailOptions {
  to: string;
  invoiceNumber: string;
  /** PDF buffer (se disponível) ou HTML da fatura para anexar. No Vercel usamos HTML para evitar Chromium. */
  pdfBuffer?: Buffer;
  htmlAttachment?: string;
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  pdfBuffer,
  htmlAttachment,
}: SendInvoiceEmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const attachments: { filename: string; content: Buffer | string }[] = [];
  if (pdfBuffer) {
    attachments.push({ filename: `facture-${invoiceNumber}.pdf`, content: pdfBuffer });
  } else if (htmlAttachment) {
    attachments.push({
      filename: `facture-${invoiceNumber}.html`,
      content: Buffer.from(htmlAttachment, 'utf-8'),
    });
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
          ${pdfBuffer ? 'Document PDF conforme aux exigences fiscales françaises.' : 'Ouvrez le fichier .html dans votre navigateur pour afficher la facture. Vous pouvez l\'imprimer ou enregistrer en PDF (Ctrl+P).'}
        </p>
        <p style="color:#6b7280;font-size:13px">
          Ce document a été généré via FactureProBR.
        </p>
      </div>
    `,
    attachments,
  });

  if (error) {
    throw new Error(error.message);
  }
}
