import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso — FactureProBR',
  description: 'Termos e condições de uso do FactureProBR.',
};

export default function TermosPage() {
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Termos de Uso</h1>
          <p className="text-slate-500 text-sm">Última atualização: {lastUpdate}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar o <strong>FactureProBR</strong>, você concorda com estes Termos de Uso.
              Se não concordar com alguma parte, não utilize o serviço.
            </p>
            <p className="mt-2">
              Estes termos constituem um contrato entre você (o <strong>Usuário</strong>) e o FactureProBR
              (o <strong>Prestador</strong>), regido pela legislação francesa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Descrição do Serviço</h2>
            <p>
              O FactureProBR é uma plataforma SaaS (Software como Serviço) que permite a auto-empreendedores
              brasileiros residentes na França:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Criar e gerir faturas no padrão fiscal francês</li>
              <li>Gerir clientes e serviços</li>
              <li>Gerar PDFs profissionais de faturas</li>
              <li>Acompanhar o estado das faturas (rascunho, enviada, paga, em atraso)</li>
            </ul>
            <p className="mt-2">
              O serviço é fornecido em português do Brasil, com saída de documentos em conformidade com a
              legislação francesa (incluindo o art. 293B do CGI).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Conta de Usuário</h2>
            <p>Para usar o FactureProBR, você deve:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Ter pelo menos 18 anos</li>
              <li>Ser auto-empreendedor legalmente registrado na França (ou estar em processo de registo)</li>
              <li>Fornecer informações verdadeiras e completas no cadastro</li>
              <li>Manter suas credenciais de acesso em sigilo</li>
            </ul>
            <p className="mt-2">
              Você é responsável por todas as ações realizadas com sua conta.
              Em caso de acesso não autorizado, notifique-nos imediatamente em{' '}
              <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Assinatura e Pagamento</h2>

            <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">4.1 Plano</h3>
            <p>
              O FactureProBR oferece um plano único de <strong>15€/mês</strong>, com acesso completo a todas
              as funcionalidades. Não há plano gratuito ou período de teste.
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">4.2 Cobrança</h3>
            <p>
              A assinatura é cobrada mensalmente de forma recorrente via cartão de crédito/débito,
              processado pelo Stripe. A primeira cobrança ocorre no momento da ativação da conta.
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">4.3 Renovação automática</h3>
            <p>
              A assinatura renova automaticamente a cada 30 dias. Você pode cancelar a qualquer momento
              antes da próxima data de renovação sem custo adicional.
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">4.4 Falha de pagamento</h3>
            <p>
              Em caso de falha no pagamento, o acesso ao serviço pode ser suspenso. Notificaremos por
              e-mail e você terá a oportunidade de atualizar seus dados de pagamento.
            </p>

            <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">4.5 Reembolsos</h3>
            <p>
              Não oferecemos reembolsos por períodos parcialmente utilizados. Após o cancelamento,
              o acesso permanece ativo até o final do período já pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do portal do cliente
              (acessível nas configurações da sua conta) ou por e-mail para{' '}
              <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>.
            </p>
            <p className="mt-2">
              Após o cancelamento, seus dados ficam disponíveis por <strong>30 dias</strong>, período durante o qual
              você pode exportar suas faturas. Após este prazo, a conta será encerrada definitivamente,
              salvo obrigações legais de retenção de dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Responsabilidades do Usuário</h2>
            <p>Ao usar o FactureProBR, você concorda em:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fornecer informações fiscais corretas e atualizadas (SIRET, dados da empresa)</li>
              <li>Verificar a conformidade das faturas geradas com a legislação aplicável à sua atividade</li>
              <li>Não utilizar o serviço para fins ilegais, fraudulentos ou enganosos</li>
              <li>Não tentar acessar dados de outros usuários</li>
              <li>Não fazer engenharia reversa ou comprometer a segurança do sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Isenção de Responsabilidade</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">⚠️ Aviso importante</p>
              <p className="text-amber-700 text-sm mt-1">
                O FactureProBR é uma ferramenta de software e <strong>não presta serviços de contabilidade ou assessoria fiscal</strong>.
                As faturas geradas seguem modelos padronizados, mas é sua responsabilidade verificar
                a conformidade com sua situação fiscal específica. Recomendamos consultar um contador
                para casos específicos.
              </p>
            </div>
            <ul className="list-disc pl-6 mt-4 space-y-1">
              <li>Não nos responsabilizamos por erros nas informações inseridas pelo usuário</li>
              <li>Não garantimos que o serviço atenderá a todos os requisitos fiscais específicos de cada atividade</li>
              <li>Nossa responsabilidade está limitada ao valor pago no último mês de assinatura</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Disponibilidade do Serviço</h2>
            <p>
              Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade
              ininterrupta. Realizamos manutenções programadas, geralmente com aviso prévio.
              Não nos responsabilizamos por perdas causadas por indisponibilidade temporária.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Propriedade Intelectual</h2>
            <p>
              O FactureProBR, incluindo seu código, design, textos e funcionalidades, é protegido por
              direitos de propriedade intelectual. Você não pode copiar, modificar, distribuir ou criar
              trabalhos derivados sem autorização expressa.
            </p>
            <p className="mt-2">
              Os <strong>dados que você insere</strong> (clientes, faturas, empresa) são de sua propriedade.
              Você nos concede apenas as licenças necessárias para operar o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Notificaremos por e-mail com pelo menos
              <strong> 30 dias de antecedência</strong> em caso de alterações significativas.
              A continuação do uso do serviço após esse prazo constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">11. Lei Aplicável e Foro</h2>
            <p>
              Estes termos são regidos pela <strong>legislação francesa</strong>.
              Qualquer litígio será submetido aos tribunais competentes da França.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">12. Contato</h2>
            <p>
              Para dúvidas sobre estes termos:{' '}
              <a href="mailto:suporte@factureprobr.xyz" className="text-blue-600 hover:underline">suporte@factureprobr.xyz</a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-sm text-slate-500">
          <span>© 2025 FactureProBR. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-700">Privacidade</Link>
            <Link href="/termos" className="hover:text-slate-700 font-medium text-blue-600">Termos de Uso</Link>
            <Link href="/" className="hover:text-slate-700">Início</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
