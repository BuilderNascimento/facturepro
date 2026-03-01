'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

export function DuplicateButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/invoices/${data.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 border border-primary-300 rounded-lg text-primary-700 hover:bg-primary-50 text-sm font-medium transition disabled:opacity-50"
    >
      <Copy className="w-4 h-4" />
      {loading ? 'Duplicando...' : 'Duplicar fatura'}
    </button>
  );
}
