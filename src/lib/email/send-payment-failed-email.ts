import { resend, FROM_EMAIL, SUPPORT_EMAIL } from './resend-client';

export async function sendPaymentFailedEmail(to: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '⚠️ Problema com o seu pagamento — FactureProBR',
    html: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Problema com pagamento</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

          <!-- Header -->
          <tr>
            <td style="background:#dc2626;padding:32px 40px;text-align:center">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:.02em">FactureProBR</h1>
              <p style="margin:6px 0 0;color:#fecaca;font-size:13px">Faturamento profissional para brasileiros na França</p>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#fef2f2;padding:16px 40px;border-bottom:1px solid #fecaca">
              <p style="margin:0;color:#dc2626;font-size:14px;font-weight:700;text-align:center">
                ⚠️ O seu pagamento mensal não foi processado
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                Tentámos cobrar a sua subscrição do <strong>FactureProBR</strong> mas o pagamento foi recusado.
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
                O seu acesso pode ser suspenso em breve. Para continuar a emitir faturas sem interrupção, 
                actualize os seus dados de pagamento agora.
              </p>

              <!-- What can happen box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:0 0 24px">
                <tr>
                  <td style="padding:20px 24px">
                    <p style="margin:0 0 10px;color:#dc2626;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">
                      O que pode acontecer
                    </p>
                    <p style="margin:4px 0;color:#7f1d1d;font-size:14px">❌ Acesso ao painel suspenso</p>
                    <p style="margin:4px 0;color:#7f1d1d;font-size:14px">❌ Impossibilidade de gerar novas faturas</p>
                    <p style="margin:4px 0;color:#7f1d1d;font-size:14px">❌ Risco de problemas fiscais com clientes pendentes</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px">
                <tr>
                  <td style="text-align:center">
                    <a href="https://factureprobr.xyz/billing-issue"
                       style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.01em">
                      Actualizar dados de pagamento →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Reassurance -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:0 0 24px">
                <tr>
                  <td style="padding:16px 24px">
                    <p style="margin:0;color:#166534;font-size:14px;line-height:1.6">
                      ✅ <strong>Os seus dados estão seguros.</strong> As suas faturas e clientes permanecem guardados. 
                      Assim que o pagamento for resolvido, o acesso é restaurado imediatamente.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">
                Precisa de ajuda? Responda este email ou contacte-nos em
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#dc2626">${SUPPORT_EMAIL}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
                FactureProBR · Cancelamento a qualquer momento<br/>
                <a href="https://factureprobr.xyz" style="color:#9ca3af">factureprobr.xyz</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
