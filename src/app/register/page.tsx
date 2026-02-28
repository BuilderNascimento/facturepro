'use client';

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-xl mb-3">
            F
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">FactureProBR</h1>
          <p className="text-slate-500 text-sm mt-1">Crie sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">

          {/* Aviso em breve */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900 mb-2">Registos em breve</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              O sistema de pagamento está sendo configurado.<br />
              Em breve poderá criar sua conta e começar a usar por <strong>15€/mês</strong>.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mb-4">
            Enquanto isso, entre em contato para ser avisado quando abrir:
          </p>

          <a
            href="mailto:suporte@factureprobr.xyz?subject=Quero criar minha conta no FactureProBR"
            className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition"
          >
            Quero ser avisado
          </a>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
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
