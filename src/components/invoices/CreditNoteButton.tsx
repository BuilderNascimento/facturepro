'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileMinus } from 'lucide-react';

export function CreditNoteButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const reason = window.prompt(
      `Nota de crédito (total) para a fatura ${invoiceNumber}.\nIndique o motivo (fica registado e não pode ser alterado):`,
    );
    if (reason === null) return;
    if (reason.trim().length < 3) {
      setError('Motivo obrigatório');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/credit-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        router.push(`/invoices/${data.id}`);
        return;
      }
      setError(data.error ?? 'Erro ao criar nota de crédito');
      if (data.id) router.push(`/invoices/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-lg text-amber-800 hover:bg-amber-50 text-sm font-medium transition disabled:opacity-50"
      >
        <FileMinus className="w-4 h-4" />
        {loading ? 'A criar...' : 'Criar nota de crédito'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </>
  );
}
