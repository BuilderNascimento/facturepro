'use client';

import { useState } from 'react';
import { AlertCircle, CreditCard, ArrowRight, LogOut } from 'lucide-react';

export default function BillingIssuePage() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Problema com o pagamento</h1>
        <p className="text-slate-500 text-sm mb-8">
          Ocorreu um problema ao renovar a sua assinatura. O seu acesso está temporariamente suspenso.
        </p>

        <div className="bg-white rounded-2xl border border-red-200 shadow-xl p-8 mb-6 text-left space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">O que aconteceu?</p>
              <p className="text-red-700 text-sm mt-1">
                O pagamento do mês foi recusado (cartão expirado, saldo insuficiente ou dados desatualizados).
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium text-slate-700">O que fazer agora:</p>
            <ul className="space-y-1.5 ml-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">1</span>
                Clique em "Atualizar cartão" abaixo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">2</span>
                Adicione ou atualize o seu cartão de pagamento
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">3</span>
                O pagamento será reprocessado automaticamente
              </li>
            </ul>
          </div>

          <button
            onClick={handlePortal}
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-base hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {loading ? 'Aguarde...' : <>Atualizar cartão <ArrowRight className="w-5 h-5" /></>}
          </button>

          <p className="text-xs text-center text-slate-400">Gerenciamento seguro via Stripe · Os seus dados estão protegidos</p>
        </div>

        <div className="space-y-3">
          <a href="mailto:suporte@factureprobr.xyz" className="block text-sm text-primary-600 hover:underline">
            Precisa de ajuda? suporte@factureprobr.xyz
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mx-auto"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
