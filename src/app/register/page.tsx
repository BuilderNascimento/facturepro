'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // 1. Criar conta no Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Este email já está cadastrado. Faça login ou use outro email.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Erro ao criar conta. Tente novamente.');
        setLoading(false);
        return;
      }

      // 2. Se não retornou sessão (email confirmation ativo), tenta login manual
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Provavelmente email não confirmado — redireciona para login com aviso
          setError('Conta criada! Verifique seu email para confirmar e depois faça login.');
          setLoading(false);
          return;
        }
      }

      // 3. Redirecionar para o Stripe checkout
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const json = await res.json();

      if (!res.ok || !json.url) {
        setError(json.error ?? 'Erro ao iniciar pagamento. Tente novamente.');
        setLoading(false);
        return;
      }

      window.location.href = json.url;
    } catch {
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-xl mb-3">
            F
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Criar minha conta</h1>
          <p className="text-slate-500 text-sm mt-1">Preencha os dados e finalize o pagamento</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">

          {/* O que você ganha */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Incluído no plano — 15€/mês</p>
            <div className="space-y-1">
              {['Faturas ilimitadas no padrão francês', 'Múltiplos clientes e apartamentos', 'PDF profissional para download', 'Suporte em português'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition mt-2"
            >
              {loading ? 'Aguarde...' : 'Continuar para o pagamento →'}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            Ao continuar, você será redirecionado para o Stripe para finalizar o pagamento seguro de 15€/mês.
          </p>

          <div className="border-t border-slate-100 mt-6 pt-4 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Já tenho conta → Entrar
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
