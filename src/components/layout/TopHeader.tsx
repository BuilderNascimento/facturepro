'use client';

import { Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TopHeaderProps {
  userEmail?: string | null;
  companyName?: string | null;
}

export function TopHeader({ userEmail, companyName }: TopHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mainLabel = companyName || userEmail?.split('@')[0] || 'Mon compte';
  const subLabel = companyName && userEmail ? userEmail : null;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-end gap-2 h-14 px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-magenta" />
      <div className="flex items-center gap-3">
        <button type="button" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <button type="button" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Aide">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg hover:bg-slate-100 text-slate-700 text-left"
          >
            <div className="flex flex-col items-end min-w-0">
              <span className="text-sm font-medium truncate max-w-[140px]">{mainLabel}</span>
              {subLabel && <span className="text-xs text-slate-500 truncate max-w-[140px]">{subLabel}</span>}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 py-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                <span className="block px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
                  {userEmail || '—'}
                </span>
                <a href="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Paramètres
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
