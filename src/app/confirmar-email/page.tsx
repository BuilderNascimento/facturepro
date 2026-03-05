'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmarEmailContent() {
  const params = useSearchParams();
  const email = params.get('email') ?? 'seu e-mail';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        {/* Ícone */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
          Verifique seu e-mail
        </h1>

        <p className="text-slate-600 mb-2">
          Enviamos um link de confirmação para:
        </p>
        <p className="font-bold text-blue-600 text-lg mb-6 break-all">{email}</p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 text-left space-y-3">
          <p className="text-sm font-semibold text-slate-700">O que fazer agora:</p>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
            <p className="text-sm text-slate-600">Abra o e-mail que acabamos de enviar</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
            <p className="text-sm text-slate-600">Clique no botão <strong>"Confirmar e-mail"</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
            <p className="text-sm text-slate-600">Você será redirecionado para finalizar o pagamento</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Não encontrou o e-mail? Verifique a pasta de spam ou lixo eletrônico.
        </p>

        <Link
          href="/login"
          className="text-sm text-blue-600 hover:underline"
        >
          Já confirmei → Fazer login
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense>
      <ConfirmarEmailContent />
    </Suspense>
  );
}
