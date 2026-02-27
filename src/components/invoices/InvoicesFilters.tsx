'use client';

import { Search, ArrowUpDown, Filter } from 'lucide-react';
import Link from 'next/link';

export function InvoicesFilters() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          placeholder="Rechercher"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          aria-label="Rechercher"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm"
        >
          <ArrowUpDown className="w-4 h-4" />
          Trié par Émission
        </button>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm">
          <Filter className="w-4 h-4" />
          Type
        </button>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm">
          Statut
        </button>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 text-sm">
          Client
        </button>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 text-sm font-medium"
        >
          + Nouvelle facture
        </Link>
      </div>
    </div>
  );
}
