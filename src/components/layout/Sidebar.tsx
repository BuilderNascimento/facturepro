'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, Briefcase, FileText, Settings,
  Plus, MessageCircle, CheckCircle2, Building2, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/invoices', label: 'Faturas', icon: FileText },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/properties', label: 'Locais de trabalho', icon: Building2 },
  { href: '/services', label: 'Serviços', icon: Briefcase },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemo) {
      await fetch('/api/demo-logout', { method: 'POST' });
      window.location.href = '/';
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const content = (
    <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-primary-800 via-primary-800 to-accent-magenta/90 text-white">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </span>
          <span className="text-xl font-bold">FacturePro</span>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/invoices/new"
          onClick={onClose}
          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Fazer fatura
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <div className="px-4 py-2 mb-1">
          <p className="text-xs text-white/50 leading-relaxed">
            🇫🇷 Faturamento conforme legislação francesa · Dados isolados e protegidos
          </p>
        </div>
        <a
          href="mailto:suporte@factureprobr.xyz"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-cyan-200 hover:bg-white/10 transition text-sm"
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          Precisa de ajuda?
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition text-sm"
        >
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: sempre visível */}
      <div className="hidden md:flex md:shrink-0">
        {content}
      </div>

      {/* Mobile: overlay quando aberto */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-10 flex">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
