export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Voltar ao início</a>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Termos de Serviço</h1>
        <p className="text-slate-500 text-sm mb-10">Última atualização: março de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aceitação dos termos</h2>
            <p>Ao criar uma conta no <strong>FactureProBR</strong>, você concorda com estes Termos de Serviço. Se não concordar, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Descrição do serviço</h2>
            <p>O FactureProBR é uma plataforma SaaS de gestão de faturas para auto-entrepreneurs brasileiros na França. O serviço permite criar, gerir e exportar faturas no padrão francês.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Conta e responsabilidade</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você é responsável por manter a confidencialidade da sua senha.</li>
              <li>Você é responsável pela exatidão dos dados inseridos (SIRET, dados da empresa, valores das faturas).</li>
              <li>O FactureProBR não se responsabiliza por erros fiscais decorrentes de dados incorretos inseridos pelo utilizador.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Pagamento e assinatura</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>O plano custa <strong>15€/mês</strong>, cobrado mensalmente via Stripe.</li>
              <li>O pagamento é recorrente e automático até o cancelamento.</li>
              <li>Não há reembolso de períodos parciais já cobrados.</li>
              <li>Pode cancelar a qualquer momento nas configurações da sua conta ou contactando o suporte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cancelamento</h2>
            <p>Pode cancelar a sua assinatura a qualquer momento. Após o cancelamento, o acesso ao serviço continua até ao fim do período já pago. Não há fidelização nem penalidades.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Disponibilidade do serviço</h2>
            <p>Fazemos o melhor esforço para manter o serviço disponível 24/7. Podem ocorrer interrupções para manutenção ou por motivos técnicos fora do nosso controlo. Não garantimos disponibilidade contínua.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Propriedade intelectual</h2>
            <p>O código, design e conteúdo do FactureProBR são propriedade dos seus criadores. Os dados inseridos por você (clientes, faturas) são e permanecem seus.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitação de responsabilidade</h2>
            <p>O FactureProBR é uma ferramenta de suporte à criação de faturas. Não somos responsáveis por obrigações fiscais, contabilísticas ou legais do utilizador perante as autoridades francesas (URSSAF, impôts, etc.). Recomendamos sempre verificar as suas obrigações com um contabilista.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Alterações aos termos</h2>
            <p>Podemos atualizar estes termos. Notificaremos por email em caso de alterações significativas. O uso continuado do serviço após as alterações implica aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contacto</h2>
            <p>Para questões sobre estes termos: <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
