'use client';

import { useState } from 'react';
import { Bell, HelpCircle, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';

interface TopHeaderProps {
  userEmail?: string | null;
  companyName?: string | null;
  onMenuToggle?: () => void;
}

export function TopHeader({ userEmail, companyName, onMenuToggle }: TopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const displayName = companyName || (userEmail ? userEmail.split('@')[0] : 'Mon compte');
  const displayEmail = userEmail ?? '';

  return (
    <header className="relative shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-accent-magenta to-primary-400" />

      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
          {displayEmail && <p className="text-xs text-slate-500 leading-tight">{displayEmail}</p>}
        </div>
      </div>

      {/* Right: icons + profile */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500" aria-label="Aide">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="relative ml-1">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-1">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Paramètres
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
