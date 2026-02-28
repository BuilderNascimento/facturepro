import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, X, ChevronDown, Star, Shield, Zap, FileText, Users, Smartphone, Lock, RefreshCw } from 'lucide-react';

export default async function LandingPage() {
  const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!IS_DEMO) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) redirect('/dashboard');
    } catch { /* sem credenciais, mostra landing */ }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">F</span>
            <span className="font-bold text-slate-900 text-lg">Facture<span className="text-blue-600">PRO BR</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium hidden sm:block">
              Entrar
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">
              Criar conta — 15€/mês
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            🇧🇷 Feito para brasileiros que trabalham na França
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-slate-900">
            Chega de fatura errada.<br />
            <span className="text-blue-600">Fature como profissional</span><br />
            na França.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            O FactureProBR gera faturas no padrão francês em menos de 2 minutos —
            em português, do seu celular ou computador.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              '✅ Compatível com URSSAF',
              '✅ Ideal para Auto-Entrepreneur',
              '✅ PDF profissional pronto para enviar',
              '✅ Funciona no celular e computador',
            ].map((item) => (
              <span key={item} className="bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-700 shadow-sm font-medium">
                {item}
              </span>
            ))}
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Criar minha conta agora — 15€/mês
          </Link>
          <p className="mt-3 text-sm text-slate-500">Sem fidelidade · Cancele quando quiser</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. DOR DO CLIENTE
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10">
            Você está cansado de:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            {[
              'Fazer faturas manualmente no Word',
              'Ter medo de errar as regras francesas',
              'Perder tempo organizando seus clientes',
              'Não saber se sua fatura está correta',
              'Receber reclamação do cliente por fatura errada',
              'Deixar dinheiro na mesa por não faturar direito',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-slate-800 rounded-xl p-4">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-600 rounded-2xl p-6">
            <p className="text-xl font-bold text-white">
              O FactureProBR resolve tudo isso para você. ✅
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. COMO FUNCIONA
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Comece em menos de 2 minutos
            </h2>
            <p className="text-slate-500">Sem burocracia. Sem complicação. Sem erro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: <Users className="w-7 h-7 text-blue-600" />,
                title: 'Cadastre seu cliente',
                desc: 'Nome, endereço e email. O sistema guarda tudo para as próximas faturas.',
              },
              {
                step: '2',
                icon: <FileText className="w-7 h-7 text-blue-600" />,
                title: 'Adicione o serviço e valor',
                desc: 'Selecione os dias trabalhados, o tipo de serviço e o valor. O total é calculado automaticamente.',
              },
              {
                step: '3',
                icon: <Zap className="w-7 h-7 text-blue-600" />,
                title: 'Gere e envie em PDF',
                desc: 'Fatura profissional no padrão francês pronta para baixar ou enviar ao seu cliente.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="flex justify-center mb-4 mt-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
            >
              Quero começar agora
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. AUTORIDADE / CONFIANÇA
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Feito para brasileiros que trabalham na França
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-6">
            O FactureProBR foi desenvolvido especificamente para atender as exigências
            do sistema de faturamento francês — Auto-Entrepreneur e Micro-Entreprise.
          </p>
          <p className="text-blue-100 text-lg leading-relaxed mb-6">
            Cada fatura gerada já vem com todos os campos obrigatórios pela legislação francesa:
            SIRET, SIREN, APE/NAF, TVA e muito mais. Pronta para enviar ao seu cliente
            ou apresentar à URSSAF.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Simples de usar', 'Profissional', 'Seguro', '100% em português'].map((tag) => (
              <span key={tag} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. BENEFÍCIOS
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Tudo que você precisa, num só lugar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <FileText className="w-6 h-6 text-blue-600" />, title: 'Faturas ilimitadas', desc: 'Crie quantas faturas precisar, sem limite.' },
              { icon: <Users className="w-6 h-6 text-blue-600" />, title: 'Clientes ilimitados', desc: 'Cadastre todos os seus clientes e acesse o histórico.' },
              { icon: <RefreshCw className="w-6 h-6 text-blue-600" />, title: 'Organização financeira', desc: 'Veja o que foi pago, enviado e em aberto.' },
              { icon: <FileText className="w-6 h-6 text-blue-600" />, title: 'PDF profissional', desc: 'Download instantâneo no padrão francês.' },
              { icon: <Smartphone className="w-6 h-6 text-blue-600" />, title: 'Qualquer dispositivo', desc: 'Celular, tablet ou computador. Funciona em tudo.' },
              { icon: <Lock className="w-6 h-6 text-blue-600" />, title: 'Dados protegidos', desc: 'Seus dados ficam seguros na nuvem, só você acessa.' },
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Suporte em português', desc: 'Atendimento em português para te ajudar.' },
              { icon: <Zap className="w-6 h-6 text-blue-600" />, title: 'Atualizações inclusas', desc: 'Novas funcionalidades sem custo adicional.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. PROVA SOCIAL
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Quem usa, aprova
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Fernanda S.',
                job: 'Diarista — Paris',
                text: 'Antes eu tinha medo de mandar fatura errada para o meu cliente francês. Hoje faço em 2 minutos pelo celular e fica perfeita. Nunca mais tive problema.',
              },
              {
                name: 'Ricardo M.',
                job: 'Construção civil — Lyon',
                text: 'Trabalho com vários clientes ao mesmo tempo e controlava tudo no caderno. Com o app ficou muito mais fácil. A fatura sai profissional e o cliente fica impressionado.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.job}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. SEGURANÇA E GARANTIA
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">Simples. Seguro. Profissional.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔓', title: 'Sem fidelidade', desc: 'Cancele quando quiser, sem perguntas.' },
              { icon: '💳', title: 'Pagamento seguro', desc: 'Processado pelo Stripe, líder mundial.' },
              { icon: '🔒', title: 'Dados protegidos', desc: 'Armazenamento seguro na nuvem.' },
              { icon: '📞', title: 'Suporte BR', desc: 'Atendimento em português.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. PREÇO
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" id="preco">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Plano Profissional</h2>
          <p className="text-slate-500 mb-10">Tudo incluso. Sem surpresas.</p>

          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-2xl p-8">
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-6xl font-extrabold text-slate-900">15</span>
              <span className="text-2xl font-bold text-slate-500 mb-2">€</span>
              <span className="text-slate-400 mb-2">/mês</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Cancele quando quiser</p>

            <ul className="text-left space-y-3 mb-8">
              {[
                'Faturas ilimitadas',
                'Clientes ilimitados',
                'PDF no padrão francês (URSSAF)',
                'Múltiplos apartamentos e locais',
                'Acesso pelo celular',
                'Atualizações inclusas',
                'Suporte em português',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition text-center"
            >
              Começar agora
            </Link>
            <p className="text-xs text-slate-400 mt-3">Sem fidelidade · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. FAQ
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'Preciso ter empresa registrada na França?',
                a: 'Sim. O FactureProBR é ideal para quem já é Auto-Entrepreneur ou Micro-Entrepreneur registrado na França. Se ainda não tem SIRET, precisa se registrar primeiro.',
              },
              {
                q: 'As faturas são aceitas na França?',
                a: 'Sim. Todas as faturas geradas seguem o padrão exigido pela legislação francesa, com SIRET, SIREN, APE/NAF e demais informações obrigatórias. Válidas para clientes e para a URSSAF.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim, sem fidelidade. Cancele a qualquer momento direto pelo app ou por email. Não cobramos nada depois do cancelamento.',
              },
              {
                q: 'Funciona no celular?',
                a: 'Perfeitamente. O app foi desenvolvido para funcionar em qualquer dispositivo — celular, tablet ou computador.',
              },
              {
                q: 'E se eu tiver dúvidas?',
                a: 'Nosso suporte é 100% em português. Entre em contato por email e respondemos rapidamente.',
              },
            ].map((item) => (
              <details key={item.q} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 list-none text-sm">
                  {item.q}
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          10. CTA FINAL
      ══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Comece hoje mesmo a faturar de forma profissional na França.
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Junte-se a centenas de brasileiros que já faturam com confiança.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-xl text-xl font-extrabold hover:bg-blue-50 transition shadow-2xl"
          >
            Criar minha conta agora — 15€/mês
          </Link>
          <p className="mt-4 text-blue-200 text-sm">Sem fidelidade · Cancele quando quiser · Suporte em português</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white font-bold text-xs">F</span>
            <span className="font-bold text-white">FactureProBR</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
            <Link href="/register" className="hover:text-white transition">Criar conta</Link>
            <a href="mailto:suporte@factureprobr.xyz" className="hover:text-white transition">Suporte</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} FactureProBR · factureprobr.xyz</p>
        </div>
      </footer>

    </div>
  );
}
