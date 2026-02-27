import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

export interface SendInvoiceEmailOptions {
  to: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
  from?: string;
}

export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  pdfBuffer,
  from = process.env.SMTP_FROM || 'FacturePro <noreply@facturepro.fr>',
}: SendInvoiceEmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP non configuré (SMTP_HOST manquant)');
  }

  await transporter.sendMail({
    from,
    to,
    subject: `Facture ${invoiceNumber}`,
    text: `Veuillez trouver ci-joint la facture ${invoiceNumber}.`,
    html: `<p>Veuillez trouver ci-joint la facture <strong>${invoiceNumber}</strong>.</p>`,
    attachments: [
      {
        filename: `facture-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
