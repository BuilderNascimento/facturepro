import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, X, ChevronDown, Star, Shield, Zap, FileText, Users, Smartphone, Lock, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';

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
              Começar agora — 15€/mês
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          1. HERO — FORTE E ESPECÍFICO
      ══════════════════════════════════════ */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50 via-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            🇧🇷 Para brasileiros que trabalham na França
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 text-slate-900">
            Gere faturas 100% válidas<br />
            na França em 2 minutos —<br />
            <span className="text-blue-600">mesmo sem falar francês.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Sistema em português, conforme padrão francês exigido pela URSSAF e art. 293B du CGI.
            Simples, rápido e seguro — do celular ou computador.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 mb-4"
          >
            Começar agora por 15€/mês →
          </Link>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
            <span>✔ Sem complicação</span>
            <span>✔ Sem risco de erro fiscal</span>
            <span>✔ Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. CONTADOR DE PROVA SOCIAL
      ══════════════════════════════════════ */}
      <section className="py-10 px-4 sm:px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '+2500', label: 'faturas geradas', icon: '📄' },
              { value: '+700', label: 'brasileiros na França', icon: '🇧🇷' },
              { value: '2 min', label: 'para emitir uma fatura', icon: '⚡' },
              { value: '100%', label: 'compatível com URSSAF', icon: '✅' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{item.value}</span>
                <span className="text-xs text-slate-500 mt-0.5 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. DOR DO CLIENTE — VOCÊ ESTÁ CANSADO
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10">
            Você está cansado de:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            {[
              'Fazer faturas manualmente no Word ou Excel',
              'Ter medo de errar as regras fiscais francesas',
              'Não saber se sua fatura está correta',
              'Depender de alguém para traduzir os campos',
              'Receber reclamação do cliente por fatura errada',
              'Perder tempo organizando clientes e pagamentos',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-slate-800 rounded-xl p-4">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-slate-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-600 rounded-2xl p-6">
            <p className="text-xl font-bold text-white">
              O FactureProBR resolve tudo isso. ✅
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. SEÇÃO EDUCATIVA — ERROS COMUNS (NOVA)
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-red-50 border-y border-red-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <AlertTriangle className="w-4 h-4" /> Atenção
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Você pode estar errando<br />sua fatura sem saber
            </h2>
            <p className="text-slate-600">
              Estes erros são comuns entre brasileiros na França — e podem causar problemas com a URSSAF.
            </p>
          </div>

          <div className="space-y-3 mb-10">
            {[
              { erro: 'Não colocar a menção TVA correta', risco: 'Fatura inválida perante a lei francesa' },
              { erro: 'Errar ou pular a numeração sequencial', risco: 'Irregularidade fiscal — proibido por lei' },
              { erro: 'Não incluir a cláusula de cobrança', risco: 'Dificuldade em cobrar juros por atraso' },
              { erro: 'Falta de SIRET ou SIREN na fatura', risco: 'Fatura recusada pelo cliente ou URSSAF' },
              { erro: 'Alterar uma fatura depois de enviada', risco: 'Prática ilegal — exige nota de crédito formal' },
              { erro: 'APE/NAF ausente ou incorreto', risco: 'Não identifica corretamente a atividade exercida' },
            ].map((item) => (
              <div key={item.erro} className="flex items-start gap-4 bg-white border border-red-200 rounded-xl p-4">
                <span className="text-red-500 text-lg shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{item.erro}</p>
                  <p className="text-red-600 text-xs mt-0.5">Risco: {item.risco}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
            <p className="text-lg font-bold mb-2">O FactureProBR faz tudo isso automaticamente.</p>
            <p className="text-blue-100 text-sm mb-4">
              Cada fatura gerada já vem com todos os campos obrigatórios pela legislação francesa, corretamente preenchidos.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition"
            >
              Proteger minha empresa agora →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. COMO FUNCIONA" id="como-funciona — 4 PASSOS
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Como funciona
            </h2>
            <p className="text-slate-500">Sem burocracia. Sem francês. Sem erro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: '⚙️',
                title: 'Cadastre sua empresa',
                desc: 'Insira seus dados de Auto-Entrepreneur: nome, SIRET, endereço. Feito uma vez, para sempre.',
              },
              {
                step: '2',
                icon: '👤',
                title: 'Escolha o cliente',
                desc: 'Selecione um cliente já cadastrado ou crie um novo em segundos.',
              },
              {
                step: '3',
                icon: '📋',
                title: 'Adicione o serviço',
                desc: 'Informe o que foi feito, os dias trabalhados e o valor. O total é calculado automaticamente.',
              },
              {
                step: '4',
                icon: '📥',
                title: 'Baixe o PDF profissional',
                desc: 'Fatura no padrão francês, pronta para enviar ao cliente ou apresentar à URSSAF.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-3xl mb-3 mt-2">{item.icon}</div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
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
          6. POSICIONAMENTO EMOCIONAL (NOVA)
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">🧠</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            Pare de depender de outras pessoas<br />para emitir suas faturas.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Tenha controle total do seu negócio na França. Emita, acompanhe e organize
            as suas faturas de onde estiver, no seu idioma, com segurança total.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🔐', title: 'Seus dados são seus', desc: 'Ninguém tem acesso às suas faturas. Privacidade garantida.' },
              { icon: '🇫🇷', title: 'Conforme a lei francesa', desc: 'Gerada no padrão exigido pela URSSAF. Sem improviso.' },
              { icon: '⏱️', title: 'Economize tempo', desc: 'O que levava 30 minutos, agora leva 2. Mais tempo para trabalhar.' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-sm mb-1">{item.title}</p>
                <p className="text-blue-200 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl"
          >
            Assumir o controle agora →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. BENEFÍCIOS
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Tudo que você precisa, num só lugar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <FileText className="w-6 h-6 text-blue-600" />, title: 'Faturas ilimitadas', desc: 'Crie quantas faturas precisar, sem limite mensal.' },
              { icon: <Users className="w-6 h-6 text-blue-600" />, title: 'Clientes ilimitados', desc: 'Cadastre todos os seus clientes e acesse o histórico completo.' },
              { icon: <TrendingUp className="w-6 h-6 text-blue-600" />, title: 'Controle financeiro', desc: 'Dashboard com faturado, recebido, pendente e em atraso.' },
              { icon: <FileText className="w-6 h-6 text-blue-600" />, title: 'PDF profissional', desc: 'Download instantâneo no padrão exigido pela legislação francesa.' },
              { icon: <Smartphone className="w-6 h-6 text-blue-600" />, title: 'Qualquer dispositivo', desc: 'Celular, tablet ou computador. Funciona em tudo.' },
              { icon: <Lock className="w-6 h-6 text-blue-600" />, title: 'Dados protegidos', desc: 'Seus dados ficam seguros na nuvem. Só você acessa.' },
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Suporte em português', desc: 'Atendimento em português para te ajudar quando precisar.' },
              { icon: <RefreshCw className="w-6 h-6 text-blue-600" />, title: 'Atualizações inclusas', desc: 'Novas funcionalidades incluídas sem custo adicional.' },
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
          8. PROVA SOCIAL — DEPOIMENTOS
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Quem usa, aprova
            </h2>
            <p className="text-slate-500">Brasileiros que trabalham na França e já usam o FactureProBR</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Fernanda S.',
                job: 'Diarista — Paris',
                text: 'Eu sempre tinha medo de mandar fatura errada para o meu cliente francês. Hoje faço em 2 minutos pelo celular e fica perfeita. Nunca mais tive problema.',
              },
              {
                name: 'Ricardo M.',
                job: 'Construção civil — Lyon',
                text: 'Trabalho com vários clientes ao mesmo tempo e controlava tudo no caderno. Com o app ficou muito mais fácil. A fatura sai profissional e o cliente fica impressionado.',
              },
              {
                name: 'Ana P.',
                job: 'Baby-sitter — Bordeaux',
                text: 'Não falo bem francês e sempre precisava pedir ajuda para alguém. Agora faço tudo sozinha em português e a fatura sai certinha no padrão francês.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-7 border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-5 italic text-sm">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
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
          9. REDUÇÃO DE RISCO
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Sem risco. Sem surpresa.</h2>
          <p className="text-slate-500 text-sm mb-10">Pensamos em cada detalhe para que você se sinta seguro.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔓', title: 'Cancele quando quiser', desc: 'Sem fidelidade, sem perguntas, sem burocracia.' },
              { icon: '💳', title: 'Pagamento 100% seguro', desc: 'Processado pelo Stripe, certificado PCI DSS.' },
              { icon: '🔒', title: 'Seus dados são privados', desc: 'Armazenamento cifrado. Ninguém acessa além de você.' },
              { icon: '🇫🇷', title: 'Padrão fiscal francês', desc: 'Faturas conforme art. 293B du CGI e exigências URSSAF.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          10. PREÇO
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6" id="precos-antigo">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Plano Profissional</h2>
          <p className="text-slate-500 mb-10">Tudo incluso. Sem surpresas. Cancele quando quiser.</p>

          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-2xl p-8">
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-6xl font-extrabold text-slate-900">15</span>
              <span className="text-2xl font-bold text-slate-500 mb-2">€</span>
              <span className="text-slate-400 mb-2">/mês</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">≈ 0,50€ por dia — menos que um café</p>

            <ul className="text-left space-y-3 mb-8">
              {[
                'Faturas ilimitadas no padrão francês',
                'Clientes e locais ilimitados',
                'PDF profissional pronto para download',
                'Dashboard financeiro completo',
                'Compatível com URSSAF e legislação francesa',
                'Acesso pelo celular ou computador',
                'Atualizações inclusas automaticamente',
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
              Começar agora — 15€/mês
            </Link>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
              <span>✔ Sem fidelidade</span>
              <span>✔ Cancelamento imediato</span>
              <span>✔ Pagamento seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          11. PREÇOS — COMPARATIVO
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-white" id="precos">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Simples e transparente</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Um plano. Tudo incluído.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Sem surpresas, sem planos complicados. Pague uma vez por mês e gere quantas faturas precisar.
            </p>
          </div>

          {/* Comparativo */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Sem FactureProBR */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">😰</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">Sem o FactureProBR</p>
                  <p className="font-bold text-slate-700 text-lg">Do jeito difícil</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Criar fatura no Word ou Excel manualmente',
                  'Errar a numeração sequencial obrigatória',
                  'Não saber as menções legais exigidas na França',
                  'Depender de alguém que fale francês',
                  'Arriscar multa por fatura fora do padrão',
                  'Gastar 1-2 horas por fatura',
                  'Perder o histórico em caso de perda do computador',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600 text-sm">
                    <span className="mt-0.5 text-red-400 shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Com FactureProBR */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 relative shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">RECOMENDADO</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">😎</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500 mb-0.5">Com o FactureProBR</p>
                  <p className="font-bold text-slate-900 text-lg">Do jeito certo</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Fatura pronta em menos de 2 minutos',
                  'Numeração sequencial automática e correta',
                  'Menções legais incluídas automaticamente',
                  'Tudo em português, sem precisar do francês',
                  'PDF profissional no padrão fiscal francês',
                  'Histórico completo salvo na nuvem',
                  'Gestão de clientes, serviços e pagamentos',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700 text-sm">
                    <span className="mt-0.5 text-blue-600 shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Plano */}
          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl border-2 border-blue-600 bg-white shadow-2xl overflow-hidden">
              <div className="bg-blue-600 px-8 py-5 text-center">
                <p className="text-blue-100 text-sm font-medium mb-1">Plano único — acesso completo</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold text-white">15</span>
                  <span className="text-xl font-bold text-blue-200 mb-1">€/mês</span>
                </div>
                <p className="text-blue-200 text-xs mt-1">Cancele quando quiser</p>
              </div>
              <div className="px-8 py-6">
                <ul className="space-y-2 mb-6">
                  {[
                    'Faturas ilimitadas',
                    'Clientes e serviços ilimitados',
                    'PDF profissional para download',
                    'Suporte em português',
                    'Atualizações incluídas',
                    'Dados protegidos e isolados',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/register"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition text-base"
                >
                  Começar agora →
                </a>
                <p className="text-xs text-slate-400 text-center mt-3">
                  Sem taxa de setup · Sem fidelidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          12. FAQ" id="faq ESTRATÉGICO
      ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'Posso usar sendo microentrepreneur (auto-entrepreneur)?',
                a: 'Sim, o FactureProBR foi feito exatamente para isso. Seja Auto-Entrepreneur, Micro-Entrepreneur ou EI registrado na França, o sistema gera suas faturas no padrão correto exigido pela legislação e pela URSSAF.',
              },
              {
                q: 'Preciso falar francês para usar?',
                a: 'Não. O sistema é 100% em português. Você preenche tudo em português e a fatura é gerada automaticamente no padrão profissional francês, com todos os campos obrigatórios.',
              },
              {
                q: 'As faturas são aceitas pela URSSAF?',
                a: 'Sim. Todas as faturas geradas incluem os campos exigidos pela legislação francesa: SIRET, SIREN, APE/NAF, menção TVA correta, cláusula de cobrança e numeração sequencial sem buracos. Compatíveis com URSSAF e clientes franceses.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim, sem fidelidade. Cancele a qualquer momento pelo próprio app ou por email. Sem taxas de saída, sem perguntas.',
              },
              {
                q: 'Meus dados ficam seguros?',
                a: 'Sim. Seus dados são armazenados com criptografia em servidores seguros. Nenhum outro usuário tem acesso às suas faturas ou dados — isolamento total garantido.',
              },
              {
                q: 'Precisa ter empresa registrada na França?',
                a: 'Sim, você precisa ter um SIRET (número de registro). O FactureProBR não registra empresas — ajuda quem já está registrado a emitir faturas corretas.',
              },
              {
                q: 'Funciona no celular?',
                a: 'Perfeitamente. O app foi desenvolvido para funcionar em qualquer dispositivo — celular, tablet ou computador. Sem necessidade de instalar nada.',
              },
              {
                q: 'E se eu tiver dúvidas?',
                a: 'Nosso suporte é 100% em português. Entre em contato por email (suporte@factureprobr.xyz) e respondemos rapidamente.',
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
          12. CTA FINAL — EMOCIONAL E FORTE
      ══════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Assuma o controle do<br />seu negócio na França.
          </h2>
          <p className="text-blue-100 text-lg mb-4 leading-relaxed">
            Pare de improvisar. Pare de depender de outros. Emita faturas profissionais,
            em conformidade com a lei francesa, em menos de 2 minutos.
          </p>
          <p className="text-blue-200 text-base mb-10 italic">
            "Fatura gerada em padrão profissional francês — mesmo sem falar francês."
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-xl text-xl font-extrabold hover:bg-blue-50 transition shadow-2xl"
          >
            Criar minha conta agora — 15€/mês
          </Link>
          <p className="mt-4 text-blue-200 text-sm">
            ✔ Sem fidelidade &nbsp;·&nbsp; ✔ Cancelamento imediato &nbsp;·&nbsp; ✔ Suporte em português
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white font-bold text-xs">F</span>
              <span className="font-bold text-white">FactureProBR</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition">Entrar</Link>
              <Link href="/register" className="hover:text-white transition">Criar conta</Link>
              <a href="mailto:suporte@factureprobr.xyz" className="hover:text-white transition">Suporte</a>
              <Link href="/privacidade" className="hover:text-white transition">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition">Termos</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs">© {new Date().getFullYear()} FactureProBR · factureprobr.xyz</p>
            <div className="flex items-center gap-4 text-xs">
              <a href="/privacidade" className="hover:text-slate-200 transition">Política de Privacidade</a>
              <span className="text-slate-700">·</span>
              <a href="/termos" className="hover:text-slate-200 transition">Termos de Uso</a>
              <span className="text-slate-700">·</span>
              <span className="text-slate-500">🇫🇷 Conforme legislação francesa · 🔒 Dados protegidos</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
