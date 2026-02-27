'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Settings,
  Plus,
  MessageCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/invoices', label: 'Documents', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/properties', label: 'Appartements', icon: Building2 },
  { href: '/services', label: 'Articles', icon: Briefcase },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (isDemo) {
      await fetch('/api/demo-logout', { method: 'POST' });
      window.location.href = '/';
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-gradient-to-b from-primary-800 via-primary-800 to-accent-magenta/90 text-white shrink-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </span>
          <span className="text-xl font-bold">FacturePro</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/90 hover:bg-white/10 text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/invoices/new"
          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Document
        </Link>
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1">
        <a
          href="mailto:support@facturepro.fr"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-cyan-200 hover:bg-white/10 transition text-sm"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          Une question ?
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition text-sm"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
