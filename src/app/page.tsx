import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">FacturePro</h1>
        <p className="text-slate-600 mb-8">
          Gestion de factures pour micro-entrepreneurs en France
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition"
          >
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
