'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

function LoginForm() {
  const [email, setEmail] = useState(IS_DEMO ? 'demo@facturepro.fr' : '');
  const [password, setPassword] = useState(IS_DEMO ? 'demo' : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorAuth = searchParams.get('error') === 'auth';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (IS_DEMO) {
      // Em modo demo, definir cookie via API e redirecionar
      await fetch('/api/demo-login', { method: 'POST' });
      router.push('/dashboard');
      router.refresh();
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white font-bold text-lg">
              F
            </span>
            <h1 className="text-2xl font-bold text-slate-800">FacturePro</h1>
          </div>
        </div>

        {IS_DEMO && (
          <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700">
            <strong>Mode démo</strong> — cliquez sur Se connecter
          </div>
        )}

        {errorAuth && (
          <p className="text-red-600 text-sm text-center mb-4">
            Erreur d&apos;authentification. Réessayez.
          </p>
        )}
        {message && (
          <p className={`text-sm text-center mb-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="vous@exemple.fr"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/" className="text-primary-600 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
