'use client';

import { useState, useMemo } from 'react';
import { InvoicesTable } from './InvoicesTable';
import { Search, ArrowUpDown, CalendarDays, AlertTriangle, Filter } from 'lucide-react';
import Link from 'next/link';

interface Row {
  id: string;
  invoice_number: string;
  reference: string;
  client: string;
  issue_date: string;
  due_date: string;
  status: string;
  displayStatus: string;
  total_ht: number;
  total_ttc: number;
}

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Em Espera', paid: 'Paga', overdue: 'Em Atraso',
};

type FilterType = 'all' | 'month' | 'year' | 'overdue';

const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Todas', icon: <Filter className="w-3.5 h-3.5" /> },
  { key: 'month', label: 'Este mês', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { key: 'year', label: 'Este ano', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { key: 'overdue', label: 'Em atraso', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
];

export function InvoicesListClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filtered = useMemo(() => {
    let result = rows;

    // Quick filter
    if (activeFilter === 'month') {
      result = result.filter((r) => {
        const d = new Date(r.issue_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (activeFilter === 'year') {
      result = result.filter((r) => new Date(r.issue_date).getFullYear() === currentYear);
    } else if (activeFilter === 'overdue') {
      result = result.filter((r) => r.status === 'overdue');
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.reference.toLowerCase().includes(q) || r.client.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, activeFilter, search, currentMonth, currentYear]);

  const filteredHT = filtered.reduce((a, r) => a + r.total_ht, 0);
  const filteredTTC = filtered.reduce((a, r) => a + r.total_ttc, 0);
  const overdueCount = rows.filter((r) => r.status === 'overdue').length;

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por referência ou cliente…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setActiveFilter(opt.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === opt.key
                  ? opt.key === 'overdue'
                    ? 'bg-red-600 text-white'
                    : 'bg-primary-600 text-white'
                  : opt.key === 'overdue' && overdueCount > 0
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.icon}
              {opt.label}
              {opt.key === 'overdue' && overdueCount > 0 && activeFilter !== 'overdue' && (
                <span className="ml-0.5 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{overdueCount}</span>
              )}
            </button>
          ))}
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 text-sm font-medium"
          >
            + Nova fatura
          </Link>
        </div>
      </div>

      {/* Total filtrado */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
          <span className="text-slate-600">
            <strong>{filtered.length}</strong> fatura{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'all' && <span className="text-primary-600 ml-1">({FILTER_OPTIONS.find(f => f.key === activeFilter)?.label})</span>}
          </span>
          <div className="flex gap-4 text-slate-700">
            <span>HT: <strong>{filteredHT.toFixed(2)} €</strong></span>
            <span>TTC: <strong>{filteredTTC.toFixed(2)} €</strong></span>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {search ? `Nenhuma fatura encontrada para "${search}".` : 'Nenhuma fatura neste filtro.'}
          </div>
        ) : (
          <InvoicesTable rows={filtered} statusLabels={statusLabels} />
        )}
      </div>
    </div>
  );
}
