import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade — FactureProBR',
  description: 'Como o FactureProBR coleta, usa e protege seus dados pessoais.',
};

export default function PrivacidadePage() {
  const lastUpdate = '05 de março de 2025';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-blue-600 text-lg">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">F</span>
            FactureProBR
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Voltar ao início</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Política de Privacidade</h1>
          <p className="text-slate-500 text-sm">Última atualização: {lastUpdate}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Quem somos</h2>
            <p>
              O <strong>FactureProBR</strong> é um serviço de software (SaaS) destinado a auto-empreendedores brasileiros
              residentes na França, que permite a geração e gestão de faturas no padrão fiscal francês.
            </p>
            <p className="mt-2">
              Responsável pelo tratamento de dados: <strong>FactureProBR</strong><br />
              Contato: <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Quais dados coletamos</h2>
            <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Dados de conta:</strong> nome, endereço de e-mail e senha (armazenada de forma criptografada)</li>
              <li><strong>Dados da empresa:</strong> nome, SIRET, forma jurídica, endereço, telefone, dados bancários (IBAN/BIC) que você insere nas configurações</li>
              <li><strong>Dados de clientes:</strong> nome, endereço, e-mail e telefone dos seus clientes que você cadastra na plataforma</li>
              <li><strong>Dados de faturas:</strong> valores, datas, descrições de serviços</li>
              <li><strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe — não armazenamos dados de cartão</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, logs de acesso (para segurança e diagnóstico)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Para que usamos seus dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer e manter o serviço de geração de faturas</li>
              <li>Processar o pagamento da assinatura mensal</li>
              <li>Enviar e-mails transacionais (boas-vindas, alertas de pagamento, faturas)</li>
              <li>Garantir a segurança e integridade da plataforma</li>
              <li>Cumprir obrigações legais e fiscais</li>
            </ul>
            <p className="mt-2">
              <strong>Não vendemos, alugamos ou compartilhamos seus dados</strong> com terceiros para fins comerciais ou de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Base legal do tratamento (RGPD)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Execução de contrato:</strong> para fornecer o serviço contratado</li>
              <li><strong>Obrigação legal:</strong> para conformidade fiscal e contábil</li>
              <li><strong>Interesse legítimo:</strong> para segurança da plataforma e prevenção de fraudes</li>
              <li><strong>Consentimento:</strong> para envio de comunicações opcionais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Quanto tempo guardamos seus dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dados de conta:</strong> enquanto a conta estiver ativa + 3 anos após encerramento</li>
              <li><strong>Dados de faturas:</strong> 10 anos (exigência fiscal francesa — art. L123-22 do Code de Commerce)</li>
              <li><strong>Dados de pagamento:</strong> conforme política do Stripe</li>
              <li><strong>Logs técnicos:</strong> 90 dias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Com quem compartilhamos seus dados</h2>
            <p>Utilizamos os seguintes prestadores de serviço, todos com políticas de privacidade compatíveis com o RGPD:</p>
            <div className="mt-3 space-y-3">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-800">Supabase</p>
                <p className="text-sm text-slate-600">Banco de dados e autenticação. Servidores na União Europeia.</p>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">supabase.com/privacy</a>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-800">Stripe</p>
                <p className="text-sm text-slate-600">Processamento de pagamentos. Certificado PCI DSS nível 1.</p>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">stripe.com/privacy</a>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-800">Resend</p>
                <p className="text-sm text-slate-600">Envio de e-mails transacionais.</p>
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">resend.com/privacy</a>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold text-slate-800">Vercel</p>
                <p className="text-sm text-slate-600">Hospedagem da aplicação.</p>
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">vercel.com/legal/privacy-policy</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Seus direitos (RGPD)</h2>
            <p>Conforme o Regulamento Geral de Proteção de Dados (RGPD — Regulamento UE 2016/679), você tem os seguintes direitos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Acesso:</strong> solicitar uma cópia de todos os seus dados</li>
              <li><strong>Retificação:</strong> corrigir dados incorretos ou incompletos</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão da sua conta e dados (salvo obrigações legais)</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato legível por máquina</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento baseado em interesse legítimo</li>
              <li><strong>Limitação:</strong> solicitar a suspensão do tratamento em determinadas circunstâncias</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, entre em contato:{' '}
              <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>.
              Responderemos em até 30 dias.
            </p>
            <p className="mt-2">
              Você também pode reclamar junto à autoridade supervisora francesa:{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CNIL (cnil.fr)</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Cookies</h2>
            <p>
              Utilizamos apenas cookies estritamente necessários para o funcionamento do serviço (sessão de autenticação).
              Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Transmissão criptografada via HTTPS/TLS</li>
              <li>Senhas armazenadas com hash seguro (bcrypt)</li>
              <li>Isolamento de dados por usuário via Row Level Security (RLS)</li>
              <li>Acesso restrito à base de dados por chaves de serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Em caso de alterações significativas,
              notificaremos por e-mail com 30 dias de antecedência. A data da última atualização
              está sempre indicada no topo desta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">11. Contato</h2>
            <p>
              Para qualquer questão relacionada à privacidade dos seus dados:<br />
              <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-sm text-slate-500">
          <span>© 2025 FactureProBR. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-700 font-medium text-blue-600">Privacidade</Link>
            <Link href="/termos" className="hover:text-slate-700">Termos de Uso</Link>
            <Link href="/" className="hover:text-slate-700">Início</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
