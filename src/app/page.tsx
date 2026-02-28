import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  FileText, CheckCircle, Zap, Shield, Users, Star,
  ArrowRight, Check, ChevronDown
} from 'lucide-react';

export default async function LandingPage() {
  // Se já está logado, vai direto para o app
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
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">F</span>
            <span className="font-bold text-slate-900 text-lg">FactureProBR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🇧🇷 Feito para brasileiros na França
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Crie sua fatura francesa<br />
            <span className="text-blue-600">em 2 minutos</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            App em português que gera faturas no padrão francês.
            Perfeito para auto-entrepreneurs, diaristas, obras, babás e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Começar agora — 15€/mês
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-xl text-lg font-semibold border border-slate-200 hover:bg-slate-50 transition"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Cancele quando quiser • Sem fidelidade</p>
        </div>
      </section>

      {/* ── PROVA SOCIAL ── */}
      <section className="py-10 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: '🧹', label: 'Diaristas' },
              { icon: '🔨', label: 'Obras & Construção' },
              { icon: '👶', label: 'Babás & Cuidadores' },
              { icon: '🌿', label: 'Jardinagem' },
              { icon: '🚗', label: 'Motoristas' },
              { icon: '💻', label: 'Freelancers' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Simples assim
            </h2>
            <p className="text-slate-600 text-lg">Sem complicação, sem formulários confusos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <Users className="w-7 h-7 text-blue-600" />,
                title: 'Cadastra o cliente',
                desc: 'Nome, endereço e email. Pronto. O sistema guarda para sempre.',
              },
              {
                step: '2',
                icon: <FileText className="w-7 h-7 text-blue-600" />,
                title: 'Seleciona os dias trabalhados',
                desc: 'Escolhe o mês, marca os dias que trabalhou e o valor por dia. O total é calculado automaticamente.',
              },
              {
                step: '3',
                icon: <Zap className="w-7 h-7 text-blue-600" />,
                title: 'Baixa ou envia a fatura',
                desc: 'PDF profissional no padrão francês pronto para imprimir ou enviar por email.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="mb-4 mt-2">{item.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Tudo que você precisa
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🇫🇷', title: 'Fatura no padrão francês', desc: 'SIRET, SIREN, APE/NAF, TVA — tudo preenchido automaticamente.' },
              { icon: '📅', title: 'Múltiplas datas por fatura', desc: 'Seleciona todos os dias do mês em que trabalhou para o mesmo cliente.' },
              { icon: '🏠', title: 'Vários apartamentos', desc: 'Um proprietário com vários imóveis? Fatura tudo junto em uma única nota.' },
              { icon: '📄', title: 'PDF profissional', desc: 'Download instantâneo com o layout correto, pronto para enviar.' },
              { icon: '👥', title: 'Múltiplos clientes', desc: 'Cadastre quantos clientes quiser e acesse o histórico de cada um.' },
              { icon: '💰', title: 'Controle financeiro', desc: 'Veja quanto faturou por mês, o que foi pago e o que está em aberto.' },
              { icon: '🔒', title: 'Dados seguros', desc: 'Seus dados ficam salvos na nuvem, acessíveis de qualquer dispositivo.' },
              { icon: '📱', title: 'Funciona no celular', desc: 'Acesse e crie faturas pelo celular, tablet ou computador.' },
              { icon: '⚡', title: 'Rápido e fácil', desc: 'Em português. Sem termos complicados. Qualquer pessoa consegue usar.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇO ── */}
      <section className="py-20 px-4 sm:px-6" id="preco">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Um plano. Simples.
          </h2>
          <p className="text-slate-600 mb-10">Sem limite de faturas, sem surpresas.</p>

          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-xl p-8">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-6">
              ⭐ PLANO COMPLETO
            </div>
            <div className="flex items-end justify-center gap-1 mb-2">
              <span className="text-6xl font-extrabold text-slate-900">15</span>
              <span className="text-2xl font-bold text-slate-600 mb-2">€</span>
              <span className="text-slate-500 mb-2">/mês</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Cancele quando quiser</p>
            <ul className="text-left space-y-3 mb-8">
              {[
                'Faturas ilimitadas',
                'Clientes ilimitados',
                'PDF no padrão francês',
                'Múltiplos apartamentos / locais',
                'Controle de pagamentos',
                'Acesso pelo celular',
                'Dados salvos na nuvem',
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
              Criar minha conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-12">
            O que dizem os usuários
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Fernanda S.',
                job: 'Diarista — Paris',
                text: 'Antes eu tinha medo de fazer a fatura errada. Agora faço em 2 minutos e fica perfeita.',
              },
              {
                name: 'Ricardo M.',
                job: 'Obras — Lyon',
                text: 'Trabalho com vários clientes e controlava tudo no caderno. Agora uso o app e é muito mais fácil.',
              },
              {
                name: 'Patrícia L.',
                job: 'Babá — Bordeaux',
                text: 'O app é em português, simples demais. Consigo fazer tudo pelo celular mesmo.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm mb-4 italic">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.job}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-12">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Precisa saber francês para usar?',
                a: 'Não! O app é 100% em português. Só a fatura que é gerada em francês, no formato correto para a França.',
              },
              {
                q: 'O que é um auto-entrepreneur?',
                a: 'É o regime de trabalho mais simples para quem presta serviços na França. Equivale ao MEI no Brasil. Se você trabalha de forma independente na França, provavelmente já é ou deveria ser um.',
              },
              {
                q: 'A fatura gerada é válida para a Urssaf?',
                a: 'Sim. A fatura segue o padrão exigido pela legislação francesa, com todos os campos obrigatórios (SIRET, SIREN, APE/NAF, etc.).',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim, sem fidelidade. Cancela quando quiser diretamente pelo app ou por email.',
              },
              {
                q: 'Meus dados ficam seguros?',
                a: 'Sim. Os dados são armazenados de forma segura na nuvem. Nenhum outro usuário tem acesso às suas faturas.',
              },
              {
                q: 'E se eu tiver dúvidas?',
                a: 'O suporte é em português. Pode entrar em contato por email e responderemos rapidamente.',
              },
            ].map((item) => (
              <details key={item.q} className="group bg-white border border-slate-200 rounded-xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 list-none">
                  {item.q}
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Junte-se aos brasileiros que já faturam de forma profissional na França.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-bold hover:bg-blue-50 transition shadow-lg"
          >
            Criar minha conta — 15€/mês
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-blue-200 text-sm">Cancele quando quiser</p>
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
