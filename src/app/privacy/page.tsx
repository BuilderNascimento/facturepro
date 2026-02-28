export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao início</a>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Quem somos</h2>
            <p>O <strong>FactureProBR</strong> é um serviço de gestão de faturas disponível em <strong>factureprobr.xyz</strong>, desenvolvido para auxiliar auto-entrepreneurs brasileiros que trabalham na França na criação de faturas profissionais.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de conta:</strong> nome, endereço de email e senha (armazenada de forma criptografada).</li>
              <li><strong>Dados da empresa:</strong> nome da empresa, SIRET, endereço, telefone, IBAN e outros dados que você inserir nas configurações.</li>
              <li><strong>Dados de clientes:</strong> nome, endereço e email dos seus clientes, inseridos por você.</li>
              <li><strong>Dados de faturamento:</strong> faturas, valores e datas criados por você.</li>
              <li><strong>Dados de pagamento:</strong> processados pelo Stripe. Não armazenamos dados de cartão de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Para fornecer e melhorar o serviço FactureProBR.</li>
              <li>Para processar pagamentos via Stripe.</li>
              <li>Para enviar comunicações relacionadas ao serviço (avisos de conta, suporte).</li>
              <li>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Armazenamento e segurança</h2>
            <p>Seus dados são armazenados de forma segura no <strong>Supabase</strong> (infraestrutura baseada na AWS). Utilizamos criptografia em trânsito (HTTPS) e em repouso. O acesso aos dados é restrito apenas ao titular da conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Seus direitos (RGPD)</h2>
            <p>Se você reside na União Europeia, tem direito a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incorretos.</li>
              <li>Solicitar a exclusão da sua conta e de todos os seus dados.</li>
              <li>Portabilidade dos seus dados.</li>
            </ul>
            <p className="mt-3">Para exercer esses direitos, entre em contato: <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cookies</h2>
            <p>Utilizamos apenas cookies essenciais para manter a sessão do utilizador autenticado. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contacto</h2>
            <p>Para questões relacionadas à privacidade: <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
