import { resend, FROM_EMAIL, SUPPORT_EMAIL } from './resend-client';

export async function sendWelcomeEmail(to: string, name?: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '🎉 Bem-vindo ao FactureProBR — o seu acesso está pronto!',
    html: `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bem-vindo ao FactureProBR</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:32px 40px;text-align:center">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:.02em">FactureProBR</h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px">Faturamento profissional para brasileiros na França</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700">
                🎉 ${name ? `Olá, ${name}! ` : ''}Seu acesso está pronto!
              </h2>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                Parabéns pela sua inscrição! Sua assinatura foi ativada com sucesso.
                A partir de agora você pode gerar faturas 100% válidas na França, em português, sem complicação.
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin:24px 0">
                <tr>
                  <td style="padding:24px">
                    <p style="margin:0 0 12px;color:#1d4ed8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">
                      Por onde começar
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px">
                          <span style="display:inline-block;width:24px;height:24px;background:#dbeafe;border-radius:50%;text-align:center;line-height:24px;font-weight:700;color:#1d4ed8;font-size:12px;margin-right:10px;vertical-align:middle">1</span>
                          Configure os dados da sua empresa em <strong>Configurações</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px">
                          <span style="display:inline-block;width:24px;height:24px;background:#dbeafe;border-radius:50%;text-align:center;line-height:24px;font-weight:700;color:#1d4ed8;font-size:12px;margin-right:10px;vertical-align:middle">2</span>
                          Adicione o seu primeiro cliente
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#374151;font-size:14px">
                          <span style="display:inline-block;width:24px;height:24px;background:#dbeafe;border-radius:50%;text-align:center;line-height:24px;font-weight:700;color:#1d4ed8;font-size:12px;margin-right:10px;vertical-align:middle">3</span>
                          Clique em <strong>+ Fazer fatura</strong> e gere o seu primeiro PDF
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>
                  <td style="text-align:center">
                    <a href="https://factureprobr.xyz/login"
                       style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:.01em">
                      Fazer login e acessar o painel →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6">
                Alguma dúvida? Responda este e-mail ou escreva para
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#1d4ed8">${SUPPORT_EMAIL}</a>.
                Estamos aqui para ajudar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
                FactureProBR · Faturamento conforme legislação francesa<br/>
                Dados isolados e protegidos · Cancelamento a qualquer momento<br/>
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
