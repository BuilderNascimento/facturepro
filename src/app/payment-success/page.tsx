'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('Confirmando seu pagamento...');

  useEffect(() => {
    let count = 0;
    const maxAttempts = 15;

    const check = async () => {
      try {
        const res = await fetch('/api/subscription/status');
        const data = await res.json();

        if (data.active) {
          setMessage('Pagamento confirmado! Redirecionando...');
          setTimeout(() => router.push('/dashboard'), 1000);
          return;
        }
      } catch {
        // continua tentando
      }

      count++;
      setAttempts(count);

      if (count >= maxAttempts) {
        setMessage('Redirecionando para o dashboard...');
        setTimeout(() => router.push('/dashboard'), 1000);
        return;
      }

      setTimeout(check, 2000);
    };

    setTimeout(check, 2000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Pagamento realizado!</h1>
        <p className="text-slate-500 mb-8">Bem-vindo ao FactureProBR</p>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">{message}</p>
          {attempts > 3 && (
            <p className="text-xs text-slate-400">
              Isso pode levar alguns segundos...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
