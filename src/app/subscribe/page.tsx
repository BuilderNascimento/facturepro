'use client';

import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? 'Erro ao iniciar pagamento.');
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
      <div className="w-full max-w-md text-center">

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl mb-4">
          F
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Ativar minha assinatura</h1>
        <p className="text-slate-500 text-sm mb-8">Para usar o FactureProBR, ative sua assinatura mensal.</p>

        <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-xl p-8 mb-6">
          <div className="flex items-end justify-center gap-1 mb-6">
            <span className="text-5xl font-extrabold text-slate-900">15</span>
            <span className="text-xl font-bold text-slate-600 mb-1">€/mês</span>
          </div>
          <ul className="text-left space-y-3 mb-8">
            {[
              'Faturas ilimitadas no padrão francês',
              'Múltiplos clientes e apartamentos',
              'PDF profissional para download',
              'Acesso pelo celular',
              'Suporte em português',
              'Cancele quando quiser',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Aguarde...' : <>Ativar agora <ArrowRight className="w-5 h-5" /></>}
          </button>
          <p className="text-xs text-slate-500 mt-3">Pagamento seguro via Stripe</p>
        </div>

        <a href="mailto:suporte@factureprobr.xyz" className="text-sm text-slate-500 hover:text-slate-700">
          Precisa de ajuda? suporte@factureprobr.xyz
        </a>
      </div>
    </div>
  );
}
