import { redirect } from 'next/navigation';
import Link from 'next/link';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

export default async function HomePage() {
  if (IS_DEMO) {
    redirect('/login');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 text-white font-bold text-2xl">
            F
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">FacturePro</h1>
        <p className="text-white/80 mb-8">
          Gestion de factures pour micro-entrepreneurs en France
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
