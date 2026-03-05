import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] RESEND_API_KEY não configurada — emails não serão enviados');
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? 'missing');

export const FROM_EMAIL = 'FactureProBR <noreply@factureprobr.xyz>';
export const SUPPORT_EMAIL = 'suporte@factureprobr.xyz';
